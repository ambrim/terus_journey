import './style.css';
import { Scene as Scene2d } from './2d/scene.js';
import { Renderer as Renderer2d } from './2d/renderer.js';
import { Title as Title } from './title.js';
//import { Scene as Scene3d } from './3d/scene.js';
//import { Renderer as Renderer3d } from './3d/renderer.js';
import titleImg from '../media/title.png';

var device: GPUDevice;
var context: GPUCanvasContext;

var title: Title;
var scene: Scene2d;
var renderer: Renderer2d;

var last_movement_key = ' ';
var pressed_keys = {
    'w': false,
    's': false,
    'a': false,
    'd': false,
    'jump': false,
}

function connect()
{
    const ws = new WebSocket('wss://' + window.location.host);
    ws.addEventListener('open', function(event)
    {
        ws.send('Hello Server!');
        window.addEventListener('keydown', event =>
        {
            if(event.key == 'ArrowUp' || event.key == 'w' || event.key == 'W')
            {
                if(!pressed_keys.w)
                    ws.send('W0');
                pressed_keys.w = true;
                last_movement_key = 'w';
            }
            else if(event.key == 'ArrowDown' || event.key == 's' || event.key == 'S')
            {
                if(!pressed_keys.s)
                    ws.send('S0');
                pressed_keys.s = true;
                last_movement_key = 's';
            }
            else if(event.key == 'ArrowLeft' || event.key == 'a' || event.key == 'A')
            {
                if(!pressed_keys.a)
                    ws.send('A0');
                pressed_keys.a = true;
                last_movement_key = 'a';
            }
            else if(event.key == 'ArrowRight' || event.key == 'd' || event.key == 'D')
            {
                if(!pressed_keys.d)
                    ws.send('D0');
                pressed_keys.d = true;
                last_movement_key = 'd';
            }
            else if(event.key == ' ')
            {
                if(!pressed_keys.jump)
                    ws.send(' 0');
                pressed_keys.jump = true;
            }
        });
        window.addEventListener('keyup', event =>
        {
            if(event.key == 'ArrowUp' || event.key == 'w' || event.key == 'W')
            {
                if(last_movement_key == 'w')
                    ws.send('W1');
                pressed_keys.w = false;
            }
            else if(event.key == 'ArrowDown' || event.key == 's' || event.key == 'S')
            {
                if(last_movement_key == 's')
                    ws.send('S1');
                pressed_keys.s = false;
            }
            else if(event.key == 'ArrowLeft' || event.key == 'a' || event.key == 'A')
            {
                if(last_movement_key == 'a')
                    ws.send('A1');
                pressed_keys.a = false;
            }
            else if(event.key == 'ArrowRight' || event.key == 'd' || event.key == 'D')
            {
                if(last_movement_key == 'd')
                    ws.send('D1');
                pressed_keys.d = false;
            }
            else if(event.key == ' ')
            {
                ws.send(' 1');
                pressed_keys.jump = false;
            }
        });
    });
    ws.addEventListener('message', function(event)
    {
        // console.log('Message from server: ', event.data);
        let renderData: RenderData;
        try
        {
            renderData = <RenderData>JSON.parse(event.data);
        }
        catch
        {
            console.log("Not JSON");
            return;
        }
        if(renderData.message === 'Player 0')
        {
            console.log("I am Player 1");
            renderer.setPlayer(0);
            renderer.render();
        }
        else if(renderData.message === 'Player 1')
        {
            console.log('I am Player 2');
            renderer.setPlayer(1);
            renderer.render();
        }
        else if(renderData.message === 'renderData')
        {
            scene.set(renderData);
        }
    });
    ws.addEventListener('error', function(event)
    {
        console.log(event);
    });
    ws.addEventListener('close', function(event)
    {
        console.log('Connection closed', event.code, event.reason, event.wasClean);
    });
}

async function initialize(canvas: HTMLCanvasElement)
{
    if(!('gpu' in navigator))
        throw 'No webGPU!';
    const adapter: GPUAdapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
    if(adapter === null)
        throw 'No adapter!';
    device = <GPUDevice>await adapter?.requestDevice();
    console.log(device);

    context = <GPUCanvasContext>canvas.getContext("webgpu");
    context.configure({
        device: device,
        format: "bgra8unorm",
        alphaMode: "opaque"
    });
}

async function login()
{
    await fetch('/login', { method: 'POST', credentials: 'same-origin' });
    connect();
}

async function main()
{
    var meta = document.createElement('meta');
    meta.httpEquiv = "origin-trial";
    meta.content = "AifDXz6Baft5VffNQoN10WMq4EpmwWAkdtyo+wvoS4uxTh51wM6Tdu0/eUJcPT8bkV/5fVM/6JfOvnsvbGg8NwkAAABQeyJvcmlnaW4iOiJodHRwczovL3ZleGlvbmEubmdyb2suaW86NDQzIiwiZmVhdHVyZSI6IldlYkdQVSIsImV4cGlyeSI6MTY3NTIwOTU5OX0=";
    document.getElementsByTagName('head')[0].appendChild(meta);

    const canvasDiv = document.createElement('div');
    canvasDiv.id = "container";

    const canvas = document.createElement('canvas');
    canvas.id = 'game-window';
    canvas.width = 1920;
    canvas.height = 1080;

    // const canvas2d = document.createElement('canvas');
    // canvas2d.width = 1920;
    // canvas2d.height = 1080;
    canvasDiv.appendChild(canvas);

    const scoreboardDiv = document.createElement('div');
    scoreboardDiv.id = "scoreboard-div"
    scoreboardDiv.style.position = 'absolute';
    scoreboardDiv.style.zIndex = "1";
    scoreboardDiv.style.right = '30px';
    const scoreboard = document.createElement('div');
    scoreboard.classList.add('scoreboard');
    scoreboard.style.height = '100px';
    scoreboard.style.width = '400px';
    scoreboard.style.textAlign = 'center';
    var p1ScoreText= document.createElement('H1');
    p1ScoreText.id = "p1-score";
    p1ScoreText.innerHTML = "Player 1 Gems: 0";
    var p2ScoreText= document.createElement('H1');
    p2ScoreText.id = "p2-score";
    p2ScoreText.innerHTML = "Player 2 Gems: 0";
    scoreboard.appendChild(p1ScoreText);
    scoreboard.appendChild(p2ScoreText);

    scoreboardDiv.appendChild(scoreboard);
    canvasDiv.appendChild(scoreboardDiv);
    //canvasDiv.appendChild(canvas2d);
    document.body.appendChild(canvasDiv);

    /*const canvas2dctx = canvas2d.getContext("2d");
    if(canvas2dctx === null) return;
    canvas2dctx.font = "bold 48px serif";
    canvas2dctx.fillStyle = "blue";
    canvas2dctx.fillText("Hello World!", 10, 10);*/
    
    await initialize(canvas);

    scene = new Scene2d();

    title = new Title();
    title.create_title();

    renderer = new Renderer2d(device, context, scene);

    await renderer.initialize();
    await login();
}

window.onload = main;