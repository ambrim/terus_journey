# COS426-Final-Project
To run the demo: mutliplayer (2 users); use incognito tabs to avoid repeated clearing of cookies.
<br>
In the case that the live link does not work for you and your partner or that the network communication crashes your browser, here is the link to a video demonstrating the gameplay:
<br>
LINK1

Title Screen
<img width="1280" alt="Screenshot 2022-12-17 at 12 02 52 AM" src="https://user-images.githubusercontent.com/113531685/208226078-a2e0f828-5520-4b67-87ce-7891c1c75f8f.png">
Gameplay
<img width="1439" alt="Screenshot 2022-12-17 at 12 00 27 AM" src="https://user-images.githubusercontent.com/113531685/208225986-88ad2308-a874-485d-9b23-61c84dde5013.png">
Victory Screen
![p1wins](https://user-images.githubusercontent.com/113531685/208226102-55de1662-bf99-4c3e-9bde-c27f69d04061.png)


To run local version:
<br>
cd ./server
<br>
npm run build
<br>
cd ../client
<br>
npm run build
<br>
cd ../dist
<br>
npm install --omit=dev
<br>
node main.bundle.js
