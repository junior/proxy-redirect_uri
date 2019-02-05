#!/bin/bash
if [ -z "$URL_TARGET" ]; then
	echo "Url target variable not set (URL_TARGET)"
	exit 1
else
	# Defaults to http if schema is not set
    # rewrite ^/(.*)\$ $URL_TARGET$1 permanent;
	if ! [[ $URL_TARGET =~ ^https?:// ]]; then
		URL_TARGET="http://$URL_TARGET"
	fi

	echo "Forwarding requests to ${URL_TARGET}..."
fi

node app.js
