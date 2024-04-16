tinybit-critical-css-server
===========================

Standalone service to generate critical CSS, built on [critical](https://github.com/addyosmani/critical).

## Install

### Locally

Run on your local machine:

```bash
git clone git@github.com:pinchofyum/tinybit-critical-css-server.git
cd tinybit-critical-css-server
npm install
npm start
```

The critical CSS server will now be running at something like http://tinybit-critical-css-server:8080, which can be used with the following to confirm that the generated critical CSS has not changed:

```bash
curl -d @test-src/request.json -H "Content-Type: application/json" -X POST http://tinybit-critical-css-server.test:8080 | jq -r '.css' > test-src/response.css && npm run test:fix
```

To test the production response:

```bash
curl -d @test-src/request.json -H "Content-Type: application/json" -X POST https://criticalcss-fd290eb.tinybit.com/ | jq -r '.css' > test-src/response.css && npm run test:fix
```

### Google Cloud Function

Run as a Google Cloud Function:

1. Create a new Cloud Run Service.
2. Select "Continuously deploy new revisions from a source repository".
3. Fork this repository, then select it as the repository to build.
4. Build type will be "Dockerfile", because Puppeteer requires extra system dependencies.
5. Complete the rest of the Create Service steps. Minimum reqs seem to be 1 GB memory, 2 CPU.

## Usage

tinybit-critical-css-server implements a simple HTTP API.

Simply `POST /` with `html` and `css` to receive `css` in response.

Check out [tinybit-critical-css-plugin](https://github.com/pinchofyum/tinybit-critical-css-plugin/) for integration with WordPress.

## Testing

The `test-src/` directory in this repository has a `response.json` with the CSS and HTML for an example request.

1. `POST` this data to the local critical CSS server started with `npm run start`.
2. Decode the JSON response and capture the return value for the `css` property.
  * Save this to a `response.json` file in a WordPress project's `wp-content` directory
  * `wp shell`
  * `$decoded = json_decode( file_get_contents( WP_CONTENT_DIR . '/response.json' ) )`
  * `$decoded->css`
  * Paste in this project's `response.css` file.
3. Auto-format the CSS with VS Code's CSS Formatter and compare via diff with the stored version.

(These could be better automated, but we really don't update it a lot.)
