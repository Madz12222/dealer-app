import requests

response = requests.post("https://jsonplaceholder.typicode.com/posts", json={
    "key": "YOUR_API_KEY",
    "action": "add",
    "service": 101,
    "link": "https://instagram.com/p/sample-post",
    "quantity": 100
})

print("Status Code:", response.status_code)
print("Response Data:", response.json())

