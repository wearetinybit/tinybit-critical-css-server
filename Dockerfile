FROM node:20

RUN apt-get update \
	&& apt-get install -y libnss3-dev

ENV DEBUG=penthouse,penthouse:core

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
RUN npm install --omit=dev

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "npm", "start" ]
