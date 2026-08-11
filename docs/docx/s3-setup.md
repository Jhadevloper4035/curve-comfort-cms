# S3 Setup for Curve Comfort CMS

This document describes the AWS S3 setup used by the Curve Comfort CMS app, the app-specific configuration, and a recommended IAM policy.

## App S3 usage

The backend uses AWS S3 only for file uploads via presigned URLs.

### Backend S3 configuration

File: `backend/src/config/s3.js`

- `AWS_REGION` is used to configure the S3 client region.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are used as the credentials.

The app creates presigned PUT URLs and deletes objects from the configured bucket.

### Upload endpoint

File: `backend/src/routes/upload.route.js`

- `S3_BUCKET` is the target bucket name.
- `AWS_REGION` is used in the public URL generation.
- Allowed MIME types are:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/avif`

Endpoints:

- `POST /api/upload/presign` — create a single presigned upload URL
- `POST /api/upload/presign-batch` — create multiple presigned upload URLs
- `DELETE /api/upload/delete` — delete an object by key

Public URL format:

- `https://<S3_BUCKET>.s3.<AWS_REGION>.amazonaws.com/<key>`

If `S3_PUBLIC_BASE_URL` is provided, it uses that base URL instead.

## Required environment variables

Set these in the backend environment:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET`
- optional: `S3_PUBLIC_BASE_URL`

Example from `backend/.env.development` and `backend/.env.production`:

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET=curve-comfort-admin-dashboard
```

> Do not commit real AWS credentials to source control. Use environment variables, secrets management, or CI/CD secret storage.

## AWS Console setup steps

### 1. Create an S3 bucket

1. Open the AWS Management Console.
2. Go to the S3 service.
3. Click `Create bucket`.
4. Enter the bucket name, for example `curve-comfort-admin-dashboard`.
5. Choose Region: `Asia Pacific (Mumbai) ap-south-1` if using the current app config.
6. Disable public access if you do not want the bucket itself to be globally readable.
7. Click `Create bucket`.

### 2. Configure bucket permissions

For presigned uploads, the bucket does not need a public read policy. The app generates temporary signed URLs that allow clients to upload directly.

If you want uploaded objects to be publicly readable, configure a bucket policy or object ACLs accordingly. Example public-read policy is not required for presigned uploads, but if you need static public assets, add a policy like this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::curve-comfort-admin-dashboard/*"]
    }
  ]
}
```

> Use public-read only when object access must be open. For secure storage, keep the bucket private and rely on presigned URLs.

### 3. Create an IAM user or IAM role

Use either an IAM user for local development or an IAM role for production infrastructure.

#### IAM policy for the app

Create a custom policy with the least privilege needed for uploads and deletes.

Example IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3PutGetDelete",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::curve-comfort-admin-dashboard/*"]
    }
  ]
}
```

- `s3:PutObject` is required for presigned upload requests.
- `s3:DeleteObject` is required for deleting objects.
- `s3:GetObject` is useful if the app or other clients need to read uploaded objects.

If you want to restrict access to a specific folder prefix, update the `Resource` to:

```json
"arn:aws:s3:::curve-comfort-admin-dashboard/uploads/*"
```

#### Attach policy

1. Open the IAM console.
2. Create a new policy using the JSON above.
3. Create a new IAM user or role.
4. Attach the policy to the user or role.
5. For a user, generate Access Key ID and Secret Access Key.
6. Store those values securely and set them in the backend environment.

### 4. Configure the backend

In your environment or `.env` file, set:

```env
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
AWS_REGION=ap-south-1
S3_BUCKET=curve-comfort-admin-dashboard
```

For CI/CD, store these values in repository secrets rather than checking them into Git.

### 5. Verify with health endpoint

The app also performs an S3 health check in `backend/src/routes/health.route.js`.

You can verify connectivity by calling the health endpoint if it exists, e.g.:

```bash
curl http://localhost:8000/api/health
```

If the bucket and credentials are configured correctly, the S3 check should pass.

## Notes and security

- Never commit `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` to Git.
- Prefer using an IAM role with temporary credentials in production.
- Use least privilege for S3 access.
- If object URLs must be public, configure the bucket policy or ACLs separately.
