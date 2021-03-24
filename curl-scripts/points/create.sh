#!/bin/bash

API="http://localhost:4741"
URL_PATH="/points"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "point": {
      "total": "'"${TOTAL}"'",
      "location": "'"${LOCATION}"'",
      "date": "'"${DATE}"'"
    }
  }'

echo
