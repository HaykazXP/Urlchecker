# Urlchecker

A Node.js tool to check URLs from a sitemap or a list of routes, logging forbidden URLs (those with uppercase letters, spaces, or special characters).

## Features

- Fetches and parses XML sitemaps (including nested sitemaps)
- Checks each URL for forbidden characters
- Logs forbidden and examined URLs to separate files
- Supports HTTP Basic Auth for protected sitemaps
- Can check URLs from a Laravel routes export

## Requirements

- Node.js (version 14 or higher recommended)
- npm

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Urlchecker.git
cd Urlchecker
```
> Replace the URL with your repository address if different.

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root with the following content:

```
SITEMAP_URL=domain
SITEMAP_USERNAME=basic-username
SITEMAP_PASSWORD=basic-password
```

> **Note:** Never commit your `.env` file. It is already included in `.gitignore`.

### 4. Export Laravel routes to `routes.txt` (optional)

If you want to check URLs from your Laravel application's routes:

1. In your Laravel project, run:
    ```bash
    php artisan route:list  > /path/to/Urlchecker/routes.txt
    ```
    - This will export all route URIs to a text file.
    - Ensure the file contains only the route paths, one per line.

2. Copy or move the generated `routes.txt` file into your `Urlchecker` project directory.

## Usage

To check URLs from the sitemap:

```bash
node checkSitemapUrls.js
```

To check URLs from `routes.txt`:

```bash
node checkRoutes.js
```

### Output

- `forbidden_urls.txt` — URLs with forbidden characters (created in the project root)
- `examined_urls.txt` — All checked URLs (created in the project root)

## Notes

- The script uses HTTP Basic Auth for sitemap access. Make sure your credentials are correct in the `.env` file.
- Forbidden URLs are those containing uppercase letters, spaces, or special characters (except `/`, `-`, `.`, `:`, `_`).

## License

This project is provided as-is without warranty. Please check the repository for license details or add your own license as needed.
