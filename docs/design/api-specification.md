# API仕様書 — SoundMap

## 1. 設計原則

### 1.1 基本方針

| 項目 | 方針 |
|------|------|
| アーキテクチャ | RESTful API |
| 実装方式 | Next.js App Router の Route Handlers（`app/api/`） |
| レスポンス形式 | JSON（`application/json`） |
| ファイルアップロード | `multipart/form-data` |
| 文字エンコーディング | UTF-8 |
| 日時フォーマット | ISO 8601（`2026-03-15T18:30:00Z`） |
| ID フォーマット | UUID v4 |

### 1.2 URL 設計規則

- リソース名は複数形の名詞を使用（例: `/api/posts`）
- ネストは 2 階層まで（例: `/api/posts/:id/play`）
- クエリパラメータはキャメルケース不使用、スネークケース不使用、シンプルな小文字

### 1.3 HTTP ステータスコード

| コード | 用途 |
|--------|------|
| `200 OK` | 取得・更新成功 |
| `201 Created` | リソース作成成功 |
| `400 Bad Request` | リクエストパラメータ不正 |
| `401 Unauthorized` | 認証が必要（トークン未送信 / 無効） |
| `403 Forbidden` | 認可エラー（権限不足） |
| `404 Not Found` | リソースが存在しない |
| `413 Payload Too Large` | ファイルサイズ超過 |
| `429 Too Many Requests` | レート制限超過 |
| `500 Internal Server Error` | サーバー内部エラー |

### 1.4 エラーレスポンス形式

全エラーレスポンスは以下の統一形式で返却する。

```json
{
  "error": "エラーメッセージ（人間向け）",
  "code": "ERROR_CODE"
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `error` | `string` | エラー内容を説明するメッセージ |
| `code` | `string` | 機械処理用のエラーコード（オプション） |

---

## 2. 認証・認可

### 2.1 認証方式

- **認証プロバイダー**: Clerk
- **トークン形式**: JWT（JSON Web Token）
- **送信方法**: `Authorization` ヘッダーに `Bearer` トークンを付与

```
Authorization: Bearer <clerk_jwt_token>
```

### 2.2 認証フロー

```mermaid
sequenceDiagram
    participant Client as クライアント
    participant Clerk as Clerk
    participant API as Next.js API
    participant DB as Supabase

    Client->>Clerk: ログイン（メール / Google / Apple）
    Clerk-->>Client: JWT トークン発行
    Client->>API: API リクエスト + Authorization: Bearer <token>
    API->>Clerk: トークン検証
    Clerk-->>API: ユーザー情報
    API->>DB: データベース操作
    DB-->>API: レスポンスデータ
    API-->>Client: JSON レスポンス
```

### 2.3 認証要否一覧

| エンドポイント | メソッド | 認証 | 説明 |
|---------------|---------|------|------|
| `GET /api/posts` | GET | 不要 | 未認証でも地図の閲覧・音声再生が可能 |
| `GET /api/posts/:id` | GET | 不要 | 投稿詳細の取得 |
| `POST /api/posts` | POST | **必須** | 音声投稿の作成 |
| `PATCH /api/posts/:id/play` | PATCH | 不要 | 再生回数のインクリメント（匿名利用を想定） |
| `POST /api/webhooks/clerk` | POST | Webhook 署名検証 | Clerk からの Webhook |

---

## 3. エンドポイント詳細

### 3.1 `GET /api/posts` — 音声投稿の一覧取得

地図のビューポートに表示すべき投稿を取得する。

#### リクエスト

- **URL**: `/api/posts`
- **メソッド**: `GET`
- **認証**: 不要

**クエリパラメータ**:

| パラメータ | 型 | 必須 | バリデーション | 説明 |
|-----------|-----|------|---------------|------|
| `north` | `number` | Yes | `-90 ≤ value ≤ 90` | ビューポート北端の緯度 |
| `south` | `number` | Yes | `-90 ≤ value ≤ 90` | ビューポート南端の緯度 |
| `east` | `number` | Yes | `-180 ≤ value ≤ 180` | ビューポート東端の経度 |
| `west` | `number` | Yes | `-180 ≤ value ≤ 180` | ビューポート西端の経度 |
| `limit` | `number` | No | `1 ≤ value ≤ 500` | 取得件数上限（デフォルト: `100`） |

**リクエスト例**:

```
GET /api/posts?north=35.7&south=35.6&east=139.8&west=139.6&limit=50
```

#### レスポンス

**成功（200 OK）**:

```json
{
  "posts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "place_name": "渋谷スクランブル交差点",
      "latitude": 35.6595,
      "longitude": 139.7004,
      "audio_url": "https://xxx.supabase.co/storage/v1/object/public/audio/user-uuid/550e8400.webm",
      "duration_ms": 30000,
      "play_count": 42,
      "recorded_at": "2026-03-15T18:30:00Z",
      "created_at": "2026-03-15T18:35:00Z",
      "user": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "username": "shota_t",
        "avatar_url": null
      }
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "place_name": "代々木公園 噴水広場",
      "latitude": 35.6714,
      "longitude": 139.6951,
      "audio_url": "https://xxx.supabase.co/storage/v1/object/public/audio/user-uuid/660e8400.webm",
      "duration_ms": 28500,
      "play_count": 15,
      "recorded_at": "2026-03-20T14:00:00Z",
      "created_at": "2026-03-20T14:05:00Z",
      "user": {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "username": "misaki_s",
        "avatar_url": "https://img.clerk.com/xxx"
      }
    }
  ],
  "total": 2
}
```

**エラー（400 Bad Request）**:

```json
{
  "error": "Missing required query parameters: north, south, east, west",
  "code": "MISSING_PARAMS"
}
```

#### 実装ノート

- Supabase クエリで `latitude BETWEEN south AND north` かつ `longitude BETWEEN west AND east` でフィルタリング
- `status = 'active'` の投稿のみ返却
- `posts` テーブルと `users` テーブルを JOIN して `user` オブジェクトを構築
- `created_at DESC` で並び替え

---

### 3.2 `GET /api/posts/:id` — 音声投稿の詳細取得

特定の投稿の詳細情報を取得する。

#### リクエスト

- **URL**: `/api/posts/:id`
- **メソッド**: `GET`
- **認証**: 不要

**パスパラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | `UUID` | Yes | 投稿の UUID |

**リクエスト例**:

```
GET /api/posts/550e8400-e29b-41d4-a716-446655440000
```

#### レスポンス

**成功（200 OK）**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "place_name": "渋谷スクランブル交差点",
  "latitude": 35.6595,
  "longitude": 139.7004,
  "audio_url": "https://xxx.supabase.co/storage/v1/object/public/audio/user-uuid/550e8400.webm",
  "duration_ms": 30000,
  "play_count": 42,
  "recorded_at": "2026-03-15T18:30:00Z",
  "created_at": "2026-03-15T18:35:00Z",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "username": "shota_t",
    "avatar_url": null
  }
}
```

**エラー（404 Not Found）**:

```json
{
  "error": "Post not found",
  "code": "NOT_FOUND"
}
```

**エラー（400 Bad Request）**:

```json
{
  "error": "Invalid post ID format",
  "code": "INVALID_ID"
}
```

---

### 3.3 `POST /api/posts` — 音声投稿の作成

新しい音声投稿を作成する。音声ファイルは `multipart/form-data` で送信する。

#### リクエスト

- **URL**: `/api/posts`
- **メソッド**: `POST`
- **認証**: **必須**（Clerk JWT）
- **Content-Type**: `multipart/form-data`

**リクエストボディ**:

| フィールド | 型 | 必須 | バリデーション | 説明 |
|-----------|-----|------|---------------|------|
| `audio` | `File` | Yes | 最大 2MB、WebM or MP4 | 音声ファイル |
| `place_name` | `string` | Yes | 1〜100 文字 | 場所名 |
| `latitude` | `number` | Yes | `-90 ≤ value ≤ 90` | 緯度 |
| `longitude` | `number` | Yes | `-180 ≤ value ≤ 180` | 経度 |
| `recorded_at` | `string` | Yes | ISO 8601 形式 | 録音日時 |

**リクエスト例**:

```
POST /api/posts
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="audio"; filename="recording.webm"
Content-Type: audio/webm

<binary audio data>
------FormBoundary
Content-Disposition: form-data; name="place_name"

鎌倉 由比ヶ浜
------FormBoundary
Content-Disposition: form-data; name="latitude"

35.3101
------FormBoundary
Content-Disposition: form-data; name="longitude"

139.5445
------FormBoundary
Content-Disposition: form-data; name="recorded_at"

2026-04-01T16:00:00Z
------FormBoundary--
```

#### レスポンス

**成功（201 Created）**:

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "place_name": "鎌倉 由比ヶ浜",
  "latitude": 35.3101,
  "longitude": 139.5445,
  "audio_url": "https://xxx.supabase.co/storage/v1/object/public/audio/user-uuid/770e8400.webm",
  "duration_ms": 30000,
  "play_count": 0,
  "recorded_at": "2026-04-01T16:00:00Z",
  "created_at": "2026-04-01T16:00:05Z"
}
```

**エラー（400 Bad Request）**:

```json
{
  "error": "Invalid audio file format. Supported: webm, mp4",
  "code": "INVALID_FORMAT"
}
```

```json
{
  "error": "Place name must be between 1 and 100 characters",
  "code": "INVALID_PLACE_NAME"
}
```

**エラー（401 Unauthorized）**:

```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**エラー（413 Payload Too Large）**:

```json
{
  "error": "Audio file size exceeds the 2MB limit",
  "code": "FILE_TOO_LARGE"
}
```

#### 処理フロー

```mermaid
sequenceDiagram
    participant Client as クライアント
    participant API as POST /api/posts
    participant Clerk as Clerk
    participant Storage as Supabase Storage
    participant DB as Supabase DB

    Client->>API: multipart/form-data（音声 + メタデータ）
    API->>Clerk: JWT トークン検証
    Clerk-->>API: ユーザー情報（user_id）

    API->>API: バリデーション（ファイル形式・サイズ・パラメータ）

    API->>Storage: 音声ファイルアップロード
    Storage-->>API: ファイル URL

    API->>DB: メタデータ INSERT（posts テーブル）
    DB-->>API: 作成された投稿レコード

    API-->>Client: 201 Created + 投稿データ
```

---

### 3.4 `PATCH /api/posts/:id/play` — 再生回数のインクリメント

音声再生完了時に再生回数をインクリメントする。

#### リクエスト

- **URL**: `/api/posts/:id/play`
- **メソッド**: `PATCH`
- **認証**: 不要（匿名ユーザーの再生もカウント）

**パスパラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `id` | `UUID` | Yes | 投稿の UUID |

**リクエスト例**:

```
PATCH /api/posts/550e8400-e29b-41d4-a716-446655440000/play
```

#### レスポンス

**成功（200 OK）**:

```json
{
  "play_count": 43
}
```

**エラー（404 Not Found）**:

```json
{
  "error": "Post not found",
  "code": "NOT_FOUND"
}
```

#### 実装ノート

- SQL: `UPDATE posts SET play_count = play_count + 1 WHERE id = $1 RETURNING play_count`
- 将来的にはレート制限を導入し、同一ユーザーによる連続インクリメントを防止

---

### 3.5 `POST /api/webhooks/clerk` — Clerk Webhook エンドポイント

Clerk からのユーザー作成 / 更新 / 削除イベントを受信し、Supabase の `users` テーブルに同期する。

#### リクエスト

- **URL**: `/api/webhooks/clerk`
- **メソッド**: `POST`
- **認証**: Clerk Webhook 署名検証（`svix` ライブラリ使用）
- **Content-Type**: `application/json`

**リクエストヘッダー**:

| ヘッダー | 説明 |
|---------|------|
| `svix-id` | Webhook イベント ID |
| `svix-timestamp` | イベント送信タイムスタンプ |
| `svix-signature` | HMAC 署名 |

**リクエストボディ（`user.created` イベント例）**:

```json
{
  "type": "user.created",
  "data": {
    "id": "user_2abc123",
    "email_addresses": [
      {
        "email_address": "shota@example.com"
      }
    ],
    "username": "shota_t",
    "image_url": "https://img.clerk.com/xxx",
    "created_at": 1711958400000
  }
}
```

#### 処理内容

| イベント | 処理 |
|---------|------|
| `user.created` | `users` テーブルに新規レコードを `INSERT` |
| `user.updated` | `users` テーブルの該当レコードを `UPDATE`（`username`, `email`, `avatar_url`） |
| `user.deleted` | `users` テーブルの該当レコードを `DELETE`（論理削除ではなく物理削除） |

#### レスポンス

**成功（200 OK）**:

```json
{
  "success": true
}
```

**エラー（400 Bad Request）**:

```json
{
  "error": "Invalid webhook signature",
  "code": "INVALID_SIGNATURE"
}
```

#### 実装ノート

- Webhook 署名の検証には `svix` パッケージを使用
- `CLERK_WEBHOOK_SECRET` 環境変数で署名検証キーを管理
- エラー時は Clerk 側がリトライするため、冪等性を考慮した実装が必要（`ON CONFLICT` を使用）

---

## 4. 共通仕様

### 4.1 レート制限

| エンドポイント | 制限 | 単位 |
|---------------|------|------|
| `GET /api/posts` | 60 リクエスト | / 分 / IP |
| `POST /api/posts` | 10 リクエスト | / 分 / ユーザー |
| `PATCH /api/posts/:id/play` | 30 リクエスト | / 分 / IP |

MVP 段階ではレート制限は Vercel のデフォルト制限に依存。拡大期に Vercel Edge Middleware での制御を検討。

### 4.2 CORS 設定

| 項目 | 値 |
|------|-----|
| `Access-Control-Allow-Origin` | 本番ドメインのみ（`https://soundmap.app`） |
| `Access-Control-Allow-Methods` | `GET, POST, PATCH, OPTIONS` |
| `Access-Control-Allow-Headers` | `Authorization, Content-Type` |

### 4.3 データ連携

| 項目 | 方針 |
|------|------|
| データ形式 | JSON（API 通信）、multipart/form-data（ファイルアップロード） |
| 通信頻度 | リアルタイム（ユーザー操作起因） |
| リトライ制御 | 音声アップロード失敗時はクライアント側で最大 3 回リトライ。エクスポネンシャルバックオフ |
| Realtime | Supabase Realtime で新規投稿をサブスクライブし、地図に即時反映（将来検討） |

### 4.4 型定義（TypeScript）

```typescript
interface Post {
  id: string;
  place_name: string;
  latitude: number;
  longitude: number;
  audio_url: string;
  duration_ms: number;
  play_count: number;
  recorded_at: string;
  created_at: string;
  user: PostUser;
}

interface PostUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface PostsResponse {
  posts: Post[];
  total: number;
}

interface CreatePostRequest {
  audio: File;
  place_name: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

interface PlayCountResponse {
  play_count: number;
}

interface ApiError {
  error: string;
  code?: string;
}
```
