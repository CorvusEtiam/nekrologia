curl -i \
    -H "Content-Type: application/json" \
    --request POST \
    --data '{"action":"list","param":"user"}' \
    http://localhost:5000/api/external

curl -i \
    -H "Content-Type: application/json" \
    --request POST \
    --data '{"action" : "show", "param" : "user", "id" : 5}' \
    http://localhost:5000/api/external 

