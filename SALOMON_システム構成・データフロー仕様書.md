# SALOMON AI マウンテンコンシェルジュ — システム構成・データフロー仕様書
**System Architecture & End-to-End Data Flow Specification (Xserver VPS構成版)**

- **対象案件**: サロモン高尾店 店頭AIマウンテンコンシェルジュ (Signage Kiosk Display System)
- **対象環境**: Xserver VPS 国内データセンター (Linux / Ubuntu 24.04 LTS) — Amer Sports 専用環境
- **対応項目**: クライアント セキュリティ質問票 C1 (システム構成図) & D12 (データフロー概要) 正式納品資料
- **ハードウェア仕様**: **110インチ 大型高精細タッチパネルディスプレイ**
- **更新日**: 2026年10月1日

---

## 1. システム構成図 (System Architecture Diagram)

![SALOMON AI マウンテンコンシェルジュ システム構成図](file:///c:/Users/medal/Downloads/mountain/SALOMON_System_Architecture_Diagram.png)

### 納品ファイル一覧（用途別）
1. **編集可能元データ (`.drawio`)**:  
   [SALOMON_System_Architecture_Diagram.drawio](file:///c:/Users/medal/Downloads/mountain/SALOMON_System_Architecture_Diagram.drawio)  
   ※ [diagrams.net](https://app.diagrams.net/)（旧draw.io）へブラウザからドラッグ＆ドロップするだけで、インストール不要・アカウント不要で全テキスト・アイコン・矢印・レイアウトを自由に編集可能です。
2. **高精細 2x Retina PNG (`.png`)**:  
   [SALOMON_System_Architecture_Diagram.png](file:///c:/Users/medal/Downloads/mountain/SALOMON_System_Architecture_Diagram.png)  
   ※ 3680×2400相当の超高解像度画像（チャットツールの圧縮を回避して鮮明に閲覧・印刷可能）。
3. **インタラクティブHTML (`.html`)**:  
   [SALOMON_System_Architecture_Diagram.html](file:///c:/Users/medal/Downloads/mountain/SALOMON_System_Architecture_Diagram.html)  
   ※ 最新ブラウザ（Chrome / Edge / Safari）で直接開くことで、拡大縮小しても劣化しないベクター表示をご確認いただけます。

---

## 2. システム構成要素の詳細 (Component Specifications)

### 2.1 利用端末 (Clients)

| コンポーネント | 設置場所 / 対象者 | 主な機能・役割 | 通信プロトコル / セキュリティ |
| :--- | :--- | :--- | :--- |
| **店頭サイネージ端末**<br>(In-Store Kiosk Display) | サロモン高尾店 店頭<br>（一般登山者・店舗来訪者） | ・**110インチ 大型高精細タッチパネルディスプレイ**<br>・高尾山 3D 地形マップ & 全8コース高低差シルエット表示<br>・高精度リアルタイム音声対話マイク入力（AI コンシェルジュ対話）<br>・**完全匿名利用（会員登録・ログイン不要・PII保持ゼロ）** | ・**HTTPS / TLS 1.3**（静的UI / 3Dモデル受信）<br>・**WSS / TLS 1.3**（暗号化リアルタイム音声ストリーム）<br>・マイク音声はメモリ処理のみ、ディスク保存なし |
| **店舗スタッフ / 管理端末**<br>(Admin / Editor Console) | 店舗バックオフィス /<br>運用スタッフ端末 | ・おすすめコールアウト編集（`CalloutEditor.tsx`）<br>・店舗からのお知らせ・登山道注意報のリアルタイム更新<br>・コンテンツの公開/非公開プレビュー切り替え | ・**PIN 認証 & 接続元 IP 制限**<br>・**MFA（多要素認証）** 適用<br>・管理者通信は全経路 HTTPS / TLS 1.3 暗号化 |
| **来訪者モバイル端末**<br>(Mobile / QR Access) | 一般来訪者の個人スマートフォン | ・110インチ画面上に表示された QR コードの読み取り<br>・スマートフォン上でのコース詳細・標高プロファイルの携帯閲覧<br>・個人情報入力画面なし（完全リードオンリー） | ・**HTTPS / TLS 1.3**（Nginx 高速エッジ直接配信）<br>・Cookie / セッション追跡なし、ローカルストレージ不使用 |

---

## 2.2 サーバー基盤 (Xserver VPS / Linux Ubuntu 24.04 LTS — 国内データセンター)

インフラストラクチャは、高速 10Gbps 回線および NVMe SSD を備えた国内データセンター（Xserver VPS）の **専用インスタンス** 上で稼働します。他社システムやデータベースとの相乗りは一切ありません。

### ① インフラ防護・セキュリティ層 (Security & Ingress Guard)
- **UFW / iptables (パケットフィルタリング)**:
  - 外部開放ポートを **80 (HTTP)** および **443 (HTTPS)** に厳格に限定。
  - 管理用 **SSH (Port 22)** は特定固定 IP アドレス（オフィス/店舗IP）からのホワイトリスト接続に限定し、公開鍵認証のみ許可（パスワード認証は完全無効化）。
  - 未使用ポートおよび不正パケットを自動的にドロップ。
- **Fail2ban (侵入・DoS自動遮断)**:
  - 異常なアクセスレートやポートスキャン、ブルートフォース攻撃をリアルタイム検知。
  - 悪意あるクライアント IP を iptables により即座に自動 BAN。
- **Certbot / 商用 SSL (常時暗号化)**:
  - Let's Encrypt / 商用 SSL 証明書による常時暗号化（**TLS 1.3 強制終端**）。
  - HSTS (HTTP Strict Transport Security) ヘッダー付与によりダウングレード攻撃を完全防止。
  - 証明書の自動更新（90日周期）をシステム常駐タスクで担保。

### ② Webサーバー & リバースプロキシ層 (Web Server & Reverse Proxy)
- **Nginx Reverse Proxy & Static Cache Engine**:
  - **静的アセット高速キャッシュ**: Next.js 静的バンドル、高尾山 3D 地形タイル (国土地理院 DEM)、3D glb モデル、画像・音声をメモリおよび NVMe ディスクにキャッシュし、ミリ秒単位で高速配信。
  - **リバースプロキシ & WSS 中継**: クライアントからのリアルタイム音声対話 WebSocket 通信 (`/api/voice/*`) をバックエンドの Next.js (Port 3000) へセキュアに中継。
  - **セキュリティヘッダー & レートリミット**: gzip/brotli 高圧縮配信、CORS ヘッダー保護、過剰アクセスからのレートリミット保護を適用。

### ③ アプリケーション実行環境 (Application Runtime)
- **PM2 Runtime Manager (プロセス管理・死活監視)**:
  - Cluster モードによる複数 CPU コア並列稼働で高スループットを実現。
  - プロセス異常停止時の **即時自動再起動（Self-Healing）**。
  - デプロイ時の **ゼロダウンタイム・ローリングリロード** に対応。
  - メモリ使用量・CPU 負荷の常時モニタリング。
- **Next.js Full-Stack App (Port 3000)**:
  - **110インチ画面最適化 UI**: 高精細ディスプレイ向けの 3D 地形描画ロジックおよび全 8 コース標高シルエットプロファイルの動的レンダリング。
  - **音声対話プロキシ**: OpenAI Realtime API とのセッション仲介およびエフェメラルトークン発行。
  - **API 中継**: 国土地理院標高タイルおよび Open-Meteo 山岳気象データの中継キャッシュ。
  - **PII 保存ゼロ**: 利用者のマイク音声および対話データはメモリ上でのみストリーム処理され、**ディスクやログへの永続化は一切行われません（保存ゼロ原則）**。

### ④ 運用管理・ガバナンス層 (Operations & Governance)
- **環境変数ファイル (`.env.production`)**:
  - OpenAI API キーおよび内部設定値は root 権限（`chmod 600`）で保護。
  - ソースコードや Git リポジトリへのハードコードを完全排除。
- **Logrotate / アクセスログ管理**:
  - Nginx および PM2 のアクセスログを日次ローテーション。
  - セキュリティ質問票のポリシーに準拠し、暗号化領域にて **90日間** 安全保管。
- **Xserver 自動スナップショット**:
  - サーバー OS およびアプリケーション環境全体の定期自動バックアップにより、有事の際も迅速な復旧（RTO 短縮）を実現。

---

## 2.3 外部連携サービス (External APIs)

| サービス名 | 連携内容 | セキュリティ & データ保護方針 |
| :--- | :--- | :--- |
| **OpenAI API Platform**<br>(GPT-4o / Realtime Voice Engine) | ・リアルタイム音声認識・自然言語解析・回答音声合成<br>・サロモン高尾店専属 AI コンシェルジュ対話 | ・**Zero Data Retention (ZDR) Policy**: 顧客データは OpenAI 側で保存されず、モデルの再学習には一切使用されません。<br>・**SOC 2 Type II** 認定取得基盤。<br>・API 通信は全件 TLS 1.3 暗号化。 |
| **国土地理院 (GSI) & 気象 API**<br>(Open Data & Open-Meteo) | ・高尾山周辺の標高 DEM タイル取得（3D レンダリング用）<br>・リアルタイム山岳気象情報（気温・風速・天候） | ・パブリックオープンデータ（個人情報送受信なし）。<br>・Nginx 経由でキャッシュ配信し、外部障害時もローカルフォールバック対応。 |
| **Amer Sports 基盤 (将来構想)**<br>(Future Enterprise IT Systems) | ・Azure AD (Entra ID) SAML SSO 管理者ログイン連携<br>・店舗在庫リアルタイム引当 API 連携 | ・**現フェーズでは直接連携なし（完全スタンドアロン構成）**。<br>・将来的なエンタープライズ拡張を見据えた疎結合インターフェース設計。 |

---

## 3. エンドツーエンド・データフロー (Data Flow Sequences)

### 【Flow 1: サイネージ端末 起動・静的コンテンツ配信】
1. 110インチ店頭サイネージ端末の電源 ON に伴い、ブラウザ（キオスクモード）が起動。
2. `https://takao.salomon.jp/` へ HTTPS (TLS 1.3) リクエスト送信。
3. **UFW / Fail2ban** によるポート・レート検証を通過。
4. **Nginx** がキャッシュから Next.js アプリケーションバンドルおよび高尾山 3D 地形モデルを端末へ高速配信（NVMe ディスク/メモリキャッシュ）。
5. 端末側で WebGL 3D レンダリングが完了し、待機画面（高尾山立体マップ & 8コース高低差シルエット）を表示。

### 【Flow 2: リアルタイム音声 AI 対話 (マイク発話 〜 回答再生)】
1. 来訪者が 110インチ画面タッチまたはマイクへ発話（例:「初心者におすすめのコースは？」）。
2. サイネージ端末から Nginx へ WebSocket 接続要求（WSS / TLS 1.3）。
3. Nginx からローカルの **Next.js (Port 3000)** へセキュアリバースプロキシ中継。
4. Next.js は `.env.production` の OpenAI API キーを使用して OpenAI Realtime API とセッションを確立。
5. 音声パケットがストリーミング送信され、GPT-4o が意図解釈および応答音声をリアルタイム生成。
6. 生成された音声ストリームが Next.js / Nginx を経由してサイネージ端末へ返送され、スピーカーよりクリアに出力。
7. **セッション終了と同時にメモリ内の音声バッファは即時消去。ディスク・ログへの音声保存は一切行われません（保存ゼロ原則）**。

### 【Flow 3: 店舗スタッフによる管理情報更新 (Callout Editor)】
1. 店舗スタッフが管理端末より `/admin` コンソールへアクセス。
2. PIN 認証および許可 IP アドレスチェック（MFA 適用）を実施。
3. コールアウト内容（おすすめポイント、登山道規制、店舗からのお知らせ等）を編集・保存。
4. Next.js 経由で設定データが更新され、Nginx キャッシュの自動リフレッシュを実行。
5. 店頭 110インチサイネージの表示へ即座に反映。

### 【Flow 4: 来訪者による QR コード携帯閲覧】
1. 110インチ画面上に表示された特定コースの QR コードをスマートフォンカメラでスキャン。
2. モバイル端末が Xserver VPS (Nginx) へ直接接続（TLS 1.3）。
3. 個人情報の入力やログインを一切介さず、コース詳細および標高プロファイルをスマートフォン上に高速表示。

---

## 4. セキュリティ基本方針・保証事項 (Security Guarantees)

1. **PII 保持ゼロ (Zero Personally Identifiable Information)**:
   - 一般利用者の氏名、住所、電話番号、メールアドレス、決済情報、カメラ映像、生体情報は一切取得・保持しません。
   - 会員登録やログインの仕組み自体を排除した完全匿名設計です。
2. **全域暗号化 (End-to-End Encryption)**:
   - 通信経路: **TLS 1.3** を強制（HTTPS / WSS）。
   - 保管データ: 秘密情報は root 権限 `chmod 600` で保護。OpenAI API キーのクライアント側露出ゼロ。
3. **二重のファイアウォール・不正侵入防護**:
   - UFW による不要ポート完全閉鎖（80/443 のみ開放、SSH は特定 IP 制限 & 鍵認証）。
   - Fail2ban による異常レート・探索攻撃のリアルタイム自動検知・IP 即時遮断。
4. **国内専用基盤 & 国際認証サービス**:
   - サーバー基盤: **Xserver VPS**（国内データセンター、専用インスタンス）。
   - AI エンジン: **OpenAI Enterprise API**（SOC 2 Type II 準拠、Zero Data Retention 保証）。
5. **Git リポジトリ・資産管理の安全性**:
   - 顧客セキュリティ質問票（Excel ファイル）および機密クレデンシャルは `.gitignore` にて厳格に除外管理され、Git への誤プッシュは 100% 防止されています。
