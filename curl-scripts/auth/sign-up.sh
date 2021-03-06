#!/bin/bash

API="http://localhost:4741"
URL_PATH="/sign-up"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --data '{
    "credentials": {
      "email": "'"${EMAIL}"'",
      "password": "'"${PASSWORD}"'",
      "password_confirmation": "'"${PASSWORD}"'",
      "firstName": "'"${FIRSTNAME}"'",
      "lastName": "'"${LASTNAME}"'",
      "zip": "'"${ZIP}"'",
      "dateOfBirth": "'"${DATEOFBIRTH}"'",
      "race": "'"${RACE}"'",
      "gender": "'"${GENDER}"'"
    }
  }'

echo
