FROM hardcoreeng/front-base:v20250310
WORKDIR /app

COPY bundle/bundle.js ./
COPY bundle/bundle.js.map ./

CMD [ "dumb-init", "node", "bundle.js" ]
