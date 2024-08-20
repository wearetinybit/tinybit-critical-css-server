FROM ghcr.io/puppeteer/puppeteer:23.1.0

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV DEBUG=penthouse,penthouse:core

WORKDIR /home/pptruser

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY --chown=pptruser:pptruser package*.json ./

# Install dependencies.
RUN ls -lrth && npm install --omit=dev

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "npm", "start" ]
