
import WebFontLoader from 'webfontloader';

import { Bird, calculateAngle } from './bird';
import { Button, DisableButton } from './button';
import { drawImage, drawImageTiled, drawFlappyText } from './draw';
import { Pipe, PIPE_START_X, NUM_PIPES } from './pipe';
import { getBestScore, setBestScore, getLeaderboard, submitBestScore, NUM_LEADERBOARD_ENTRIES, type LeaderboardEntry } from './score';

// Image imports
import bgImage from '../img/background.png';
import bgBlankImage from '../img/backgroundBlank.png';
import pipeImage from '../img/pipe.png';
import pipeHeadImage from '../img/pipeHead.png';
import groundImage from '../img/ground.png';
import tapInfoImage from '../img/tapInfo.png';
import newImage from '../img/new.png';
import buttonPlayImage from '../img/buttonPlay.png';
import buttonPauseImage from '../img/buttonPause.png';
import buttonRestartImage from '../img/buttonRestart.png';
import buttonLeaderboardImage from '../img/buttonLeaderboard.png';
import buttonSubmitImage from '../img/buttonSubmit.png';
import buttonSubmitDisabledImage from '../img/buttonSubmitDisabled.png';
import buttonRetryImage from '../img/buttonRetry.png';
import buttonTrolleymanOrgImage from '../img/buttonTrolleymanOrg.png';
import flappy0Image from '../img/flappy0.png';
import flappy1Image from '../img/flappy1.png';
import flappy2Image from '../img/flappy2.png';
import flappy3Image from '../img/flappy3.png';
import deadFlappy0Image from '../img/deadFlappy0.png';
import deadFlappy1Image from '../img/deadFlappy1.png';
import deadFlappy2Image from '../img/deadFlappy2.png';
import deadFlappy3Image from '../img/deadFlappy3.png';

import { isValidName, isValidNameChar, MAX_NAME_LENGTH } from './validation';
import { lerpFloor, lerp, LEADERBOARD_THRESHOLD_WIDTH, LEADERBOARD_THRESHOLD_HEIGHT, MAX_LEADERBOARD_WIDTH, LEADERBOARD_SMALLER_THRESHOLD_HEIGHT } from './sizing';

interface GameImages {
    // Single images
    bg: HTMLImageElement;
    bgBlank: HTMLImageElement;
    pipe: HTMLImageElement;
    pipeHead: HTMLImageElement;
    ground: HTMLImageElement;
    tapInfo: HTMLImageElement;
    new: HTMLImageElement;
    buttonPlay: HTMLImageElement;
    buttonPause: HTMLImageElement;
    buttonRestart: HTMLImageElement;
    buttonLeaderboard: HTMLImageElement;
    buttonSubmit: HTMLImageElement;
    buttonSubmitDisabled: HTMLImageElement;
    buttonRetry: HTMLImageElement;
    buttonTrolleymanOrg: HTMLImageElement;
    // Image arrays
    flappy: HTMLImageElement[];
    deadFlappy: HTMLImageElement[];
}

const PIPE_SPACING_X = 250;

const MAX_VEL_Y = 400;

const STATE_LOADING = 0;
const STATE_START = 1;
const STATE_PLAYING = 2;
const STATE_PAUSED = 3;
const STATE_DEATH = 4;
const STATE_LEADERBOARD = 5;
const STATE_LEADERBOARD_ERROR = 6;
const STATE_ERROR = 7;
const STATE_FINISHED = 8;

const WHICH_CODE_SPACE = 32;

function stateToString(state: number): string {
    if (state === STATE_LOADING) return "STATE_LOADING";
    else if (state === STATE_START) return "STATE_START";
    else if (state === STATE_PLAYING) return "STATE_PLAYING";
    else if (state === STATE_PAUSED) return "STATE_PAUSED";
    else if (state === STATE_DEATH) return "STATE_DEATH";
    else if (state === STATE_LEADERBOARD) return "STATE_LEADERBOARD";
    else if (state === STATE_LEADERBOARD_ERROR) return "STATE_LEADERBOARD_ERROR";
    else if (state === STATE_FINISHED) return "STATE_FINISHED";
    else return "Invalid state: " + state;
}

function copyTouch(t: Touch): { identifier: number; pageX: number; pageY: number } {
    return { identifier: t.identifier, pageX: t.pageX, pageY: t.pageY };
}

export class Game {
    canvas: HTMLCanvasElement;
    statsContainer: HTMLDivElement;
    stats: HTMLElement;
    usernameEntry: HTMLInputElement;

    onmousedown: (e: MouseEvent) => void;
    onmouseup: (e: MouseEvent) => void;
    onmousemove: (e: MouseEvent) => void;
    mousePos: { x: number, y: number } | null = null;

    ontouchstart: (e: TouchEvent) => void;
    ontouchend: (e: TouchEvent) => void;
    ontouchcancel: (e: TouchEvent) => void;
    ontouchmove: (e: TouchEvent) => void;
    touches: Touch[];

    onkeyup: (e: KeyboardEvent) => void;
    onkeydown: (e: KeyboardEvent) => void;
    keyCodes: { [key: string]: boolean };
    keyWhichs: { [key: number]: boolean };
    keyUps: KeyboardEvent[];
    keyDowns: KeyboardEvent[];

    flappyFontLoaded: boolean;
    imgs: GameImages;
    flappysLoaded: boolean;
    flappysLoadedNum: number = 0;
    imagesLoadedMax: number = 0;
    imagesLoadedNum: number = 0;

    buttonPlay: Button;
    buttonPause: Button;
    buttonRestartDeath: Button;
    buttonLeaderboard: Button;
    buttonRestartLeaderboard: Button;
    buttonSubmit: DisableButton;
    buttonRestartLeaderboardError: Button;
    buttonRetry: Button;
    buttonTrolleymanOrg: Button;

    pipes: Pipe[];

    handleVisibilityChange: () => void;

    debugAllowed: boolean;
    debugView: boolean;

    cameraUpdate: boolean;

    flappyDt: number;
    paused: boolean;
    cameraX: number;

    state_: number = STATE_LOADING;
    stateChangeTime: number = Date.now().valueOf();

    buttons: (Button | DisableButton)[] = [];

    bird: Bird;
    flappyi: number = 0;
    regenPipes: boolean = false;
    flappyVisible: boolean = false;
    groundVisible: boolean = false;
    deadFlappyImage: boolean = false;

    gravity: number = 0;

    score: number = 0;
    bestScore: number = 0;
    newBestScore: boolean = false;

    prevTime: number = NaN;

    oscillate: boolean = false;

    flappyStopped: boolean = false;

    leaderboard: LeaderboardEntry[] = [];
    leaderboardLoading: boolean = false;
    leaderboardPos: number = 0;

    submitting: boolean = false;
    submittingStartTime: number = 0;
    errorSubmitting: boolean = false;
    submitted: boolean = false;

    pipeMax: number = 0;
    errorMessage: string = "";

    constructor(canvas: HTMLCanvasElement, statsContainer: HTMLDivElement, stats: HTMLElement, usernameEntry: HTMLInputElement) {
        this.canvas = canvas;
        this.statsContainer = statsContainer;
        this.stats = stats;
        this.usernameEntry = usernameEntry;

        this.bird = new Bird(this);

        this.onmousedown = (e: MouseEvent): void => {
            e.preventDefault();

            // Scale mouse coordinates to match actual canvas dimensions
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = e.offsetX * scaleX;
            const y = e.offsetY * scaleY;

            console.log("mouse pressed @ " + x + ", " + y);
            this.flap();
            this.press(x, y);
        }

        this.onmouseup = (e: MouseEvent): void => { }

        this.onmousemove = (e: MouseEvent): void => {
            // Scale mouse coordinates to match actual canvas dimensions
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.mousePos = {
                x: e.offsetX * scaleX,
                y: e.offsetY * scaleY
            };
        }

        this.canvas.addEventListener("mousedown", this.onmousedown);
        this.canvas.addEventListener("mouseup", this.onmouseup);
        this.canvas.addEventListener("mousemove", this.onmousemove);

        this.ontouchstart = (e: TouchEvent): void => {
            e.preventDefault();

            this.flap();
            const touches = e.changedTouches;
            for (let i = 0; i < touches.length; i++) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.targetTouches[0].pageX - rect.left;
                const y = e.targetTouches[0].pageY - rect.top;

                const t = touches[i];
                console.log("touch @ " + x + ", " + y);
                this.press(x, y);
            }
        }

        this.ontouchend = (e: TouchEvent): void => { }
        this.ontouchcancel = (e: TouchEvent): void => { }
        this.ontouchmove = (e: TouchEvent): void => { }

        this.canvas.addEventListener("touchstart", this.ontouchstart);
        this.canvas.addEventListener("touchend", this.ontouchend);
        this.canvas.addEventListener("touchcancel", this.ontouchcancel);
        this.canvas.addEventListener("touchmove", this.ontouchmove);
        this.touches = [];

        // setup keys
        this.keyCodes = {} as { [key: string]: boolean };
        this.keyWhichs = {} as { [key: number]: boolean };
        this.keyUps = [];
        this.keyDowns = [];
        this.onkeyup = (e: KeyboardEvent) => {
            this.keyCodes[e.code] = false;
            this.keyWhichs[e.which] = false;
            this.keyUps[this.keyUps.length] = e;
        }
        this.onkeydown = (e: KeyboardEvent) => {
            this.keyCodes[e.code] = true;
            this.keyWhichs[e.which] = true;
            this.keyDowns[this.keyDowns.length] = e;
        }
        window.addEventListener("keyup", this.onkeyup);
        window.addEventListener("keydown", this.onkeydown);

        this.flappyFontLoaded = false;
        const loadFlappyFont = () => {
            WebFontLoader.load({
                custom: {
                    families: ['FlappyFont'],
                },
                fontactive: (familyName, fvd) => {
                    if (familyName === 'FlappyFont') {
                        console.log("FlappyFont loaded.");
                        this.flappyFontLoaded = true;
                        this.notifyLoadedFont();
                    }
                },
                fontinactive: (familyName, fvd) => {
                    if (familyName === 'FlappyFont') {
                        console.log("FlappyFont could not be downloaded.");
                        this.flappyFontLoaded = true;
                        this.notifyLoadedFont();
                    }
                },
            });
        };

        // load images
        this.flappysLoaded = false;
        const loadFlappyFunc = () => {
            this.flappysLoadedNum += 1;
            if (this.flappysLoadedNum === 4) {
                this.flappysLoaded = true;
                // Trigger font loading
                loadFlappyFont();
            }
        };

        // Initialize image arrays
        const flappyImages: HTMLImageElement[] = [
            this.loadImage(flappy0Image, loadFlappyFunc),
            this.loadImage(flappy1Image, loadFlappyFunc),
            this.loadImage(flappy2Image, loadFlappyFunc),
            this.loadImage(flappy3Image, loadFlappyFunc)
        ];
        const deadFlappyImages: HTMLImageElement[] = [
            this.loadImage(deadFlappy0Image),
            this.loadImage(deadFlappy1Image),
            this.loadImage(deadFlappy2Image),
            this.loadImage(deadFlappy3Image)
        ];

        // Initialize all images at once
        this.imgs = {
            // Single images
            bg: this.loadImage(bgImage),
            bgBlank: this.loadImage(bgBlankImage),
            pipe: this.loadImage(pipeImage),
            pipeHead: this.loadImage(pipeHeadImage),
            ground: this.loadImage(groundImage),
            tapInfo: this.loadImage(tapInfoImage),
            new: this.loadImage(newImage),
            buttonPlay: this.loadImage(buttonPlayImage),
            buttonPause: this.loadImage(buttonPauseImage),
            buttonRestart: this.loadImage(buttonRestartImage),
            buttonLeaderboard: this.loadImage(buttonLeaderboardImage),
            buttonSubmit: this.loadImage(buttonSubmitImage),
            buttonSubmitDisabled: this.loadImage(buttonSubmitDisabledImage),
            buttonRetry: this.loadImage(buttonRetryImage),
            buttonTrolleymanOrg: this.loadImage(buttonTrolleymanOrgImage),
            // Image arrays
            flappy: flappyImages,
            deadFlappy: deadFlappyImages
        };

        // Setup buttons
        const setState = (s: number) => { this.state = s; };
        const spacing = 20;
        const fx = this.getPauseButtonOffsetX.bind(this);
        const fy = this.getPauseButtonOffsetY.bind(this);
        this.buttonPlay = new Button(fx, fy, this.imgs.buttonPlay, () => setState(STATE_PLAYING));
        this.buttonPause = new Button(fx, fy, this.imgs.buttonPause, () => setState(STATE_PAUSED));
        const dy = this.getGameOverButtonsY.bind(this);
        const getX = () => {
            const w = spacing + this.imgs.buttonRestart.width + this.imgs.buttonLeaderboard.width;
            const x = this.canvas.width / 2 - w / 2;
            return x;
        }
        this.buttonRestartDeath = new Button(
            getX, dy,
            this.imgs.buttonRestart,
            () => setState(STATE_START));
        this.buttonLeaderboard = new Button(
            () => getX() + spacing + this.imgs.buttonRestart.width, dy,
            this.imgs.buttonLeaderboard,
            () => setState(STATE_LEADERBOARD));
        const ly = this.getLeaderboardButtonsY.bind(this);
        this.buttonRestartLeaderboard = new Button(
            () => this.canvas.width / 2 - this.imgs.buttonRestart.width - spacing / 2, ly,
            this.imgs.buttonRestart,
            () => setState(STATE_START));

        const submitFunction = () => {
            const name = this.usernameEntry.value;
            const ret = isValidName(name);
            if (!ret.valid) {
                console.error("'" + name + "' is invalid: " + ret.reason);
                alert(ret.reason);
                return;
            }
            console.log("Submitting best score for '" + name + "': " + this.bestScore);
            this.submitting = true;
            this.submittingStartTime = Date.now().valueOf() / 1000.0;
            this.errorSubmitting = false;
            this.submitted = false;
            this.endTextEntryMode();
            this.leaderboard[this.leaderboardPos].name = name;
            submitBestScore(name, this.bestScore).then(() => {
                console.log("Submitted score.");
                this.submitting = false;
                this.submitted = true;
            }).catch((error: string) => {
                this.submitting = false;
                this.submitted = false;
                console.log("error submitting score: " + error);
                this.errorSubmitting = true;
            });
        };

        const disableFunction = () => {
            if (!this.newBestScore
                || this.leaderboardLoading
                || !isValidName(this.usernameEntry.value).valid
                || this.submitting || this.submitted)
                return true;
            return false;
        };
        this.buttonSubmit = new DisableButton(
            () => this.canvas.width / 2 + spacing / 2, ly,
            this.imgs.buttonSubmit, this.imgs.buttonSubmitDisabled, submitFunction, disableFunction);

        const dy2 = 400;
        this.buttonRestartLeaderboardError = new Button(
            () => this.canvas.width / 2 - this.imgs.buttonRestart.width - spacing / 2, dy2,
            this.imgs.buttonRestart,
            () => setState(STATE_START));
        this.buttonRetry = new Button(
            () => this.canvas.width / 2 + spacing / 2, dy2,
            this.imgs.buttonRetry, () => setState(STATE_LEADERBOARD));

        this.buttonTrolleymanOrg = new Button(
            () => this.getTopLeftButtonOffset(),
            () => this.getTopLeftButtonOffset(),
            this.imgs.buttonTrolleymanOrg,
            () => window.location.href = `${window.location.href}/..`
        );

        // Setup pipes
        this.pipes = [];
        for (let i = 0; i < NUM_PIPES; i++) {
            this.pipes[i] = new Pipe(PIPE_START_X, this.getPipeY());
        }

        // Setup handling focus events. see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API

        // If the page is hidden, pause the game
        // If the page is hidden, unpause the game, unless it is in the STATE_PAUSED state
        this.handleVisibilityChange = () => {
            if (typeof document.hidden === "undefined") {
                console.log("Error: Page Visibility API not supported.");
                return;
            }
            if (document.hidden) {
                console.log("Page hidden: paused.");
                this.pause();
                if (this.state === STATE_PLAYING)
                    this.state = STATE_PAUSED;
            } else {
                if (this.state !== STATE_PAUSED) {
                    console.log("Page unhidden: resumed.");
                    this.unpause();
                }
            }
        };

        // Warn if the browser doesn't support addEventListener or the Page Visibility API
        if (typeof document.hidden === "undefined") {
            console.log("Error: Page Visibility API not supported.");
        } else {
            // Handle page visibility change   
            document.addEventListener("visibilitychange", this.handleVisibilityChange, false);
        }

        // Setup stats
        this.stats = stats;

        // Setup vars
        this.debugAllowed = import.meta.env.DEV; // is debugging allowed?
        this.debugView = false;
        this.cameraUpdate = true; // update the camera to be locked onto the bird?
        this.flappyDt = 0.08; // seconds per flappy frame
        this.paused = false;
        this.cameraX = 0;

        this.beginTextEntryMode();
        this.endTextEntryMode();

        // Setup state
        this.state = STATE_LOADING;
    }

    dispose(): void {
        this.state = STATE_FINISHED;

        this.canvas.removeEventListener("mousedown", this.onmousedown);
        this.canvas.removeEventListener("mouseup", this.onmouseup);
        this.canvas.removeEventListener("mousemove", this.onmousemove);
        this.canvas.removeEventListener("touchstart", this.ontouchstart);
        this.canvas.removeEventListener("touchend", this.ontouchend);
        this.canvas.removeEventListener("touchcancel", this.ontouchcancel);
        this.canvas.removeEventListener("touchmove", this.ontouchmove);

        window.removeEventListener("keyup", this.onkeyup);
        window.removeEventListener("keydown", this.onkeydown);

        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }

    loadImage(name: string, f?: () => void): HTMLImageElement {
        if (typeof f === "undefined")
            f = function () { };
        if (typeof this.imagesLoadedMax === "undefined")
            this.imagesLoadedMax = 0;
        this.imagesLoadedMax += 1;

        const img = new Image();
        img.onload = () => {
            f!();
            console.log('Loaded image: ' + name + '(loaded ' + ((this.imagesLoadedNum || 0) + 1) + '/' + this.imagesLoadedMax + ')')
            this.notfiyLoadedImage();
        };
        img.onerror = () => {
            this.errorMessage = "Image " + name + " could not be loaded";
            this.state = STATE_ERROR;
        };
        img.src = name;
        console.log('Loading image: ' + name + '...')
        return img;
    }

    notfiyLoadedImage(): void {
        if (typeof this.imagesLoadedNum === "undefined")
            this.imagesLoadedNum = 0;
        this.imagesLoadedNum += 1;

        if (this.imagesLoaded) {
            console.log(this.imagesLoadedNum + " images loaded.");
            this.notifyLoadedResource();
        }
    }

    notifyLoadedFont(): void {
        this.notifyLoadedResource();
    }

    notifyLoadedResource(): void {
        if (this.imagesLoaded && this.flappyFontLoaded) {
            this.state = STATE_START;
        }
    }

    get imagesLoaded(): boolean {
        return this.imagesLoadedNum === this.imagesLoadedMax;
    }

    get flappyCurrent(): HTMLImageElement {
        if (this.deadFlappyImage)
            return this.imgs.deadFlappy[Math.floor(this.flappyi)];
        else
            return this.imgs.flappy[Math.floor(this.flappyi)];
    }

    get stateChangeDt(): number {
        return (Date.now().valueOf() - this.stateChangeTime) / 1000.0;
    }

    get state(): number {
        return this.state_;
    }

    set state(s: number) {
        const GRAVITY = -800;
        console.log("STATE CHANGE: " + stateToString(this.state_) + " => " + stateToString(s));
        this.stateChangeTime = Date.now().valueOf();
        const prevState = this.state_;
        this.state_ = s;
        this.endTextEntryMode();
        if (this.state === STATE_LOADING) {
            this.buttons = [];
            this.bird = new Bird(this);
            this.paused = true; // no updates
            this.flappyi = 0;
            this.regenPipes = false;
            this.cameraUpdate = false;
            this.flappyVisible = false;
            this.groundVisible = false;

        } else if (this.state === STATE_START) {
            this.buttons = [];
            this.deadFlappyImage = false;
            this.gravity = 0;
            this.bestScore = getBestScore();
            this.prevTime = NaN; // clear prevTime
            this.score = 0;
            this.paused = false;
            this.bird = new Bird(this);
            this.flappyi = 0;
            this.oscillate = true;
            this.regenPipes = false;
            this.cameraUpdate = true;
            this.flappyStopped = false;
            this.flappyVisible = true;
            this.groundVisible = true;
            for (var i = 0; i < this.pipes.length; i++) {
                this.pipes[i] = new Pipe(PIPE_START_X, this.getPipeY());
            }

        } else if (this.state === STATE_PLAYING) {
            this.buttons = [this.buttonTrolleymanOrg, this.buttonPause];
            this.deadFlappyImage = false;
            this.gravity = GRAVITY;
            this.oscillate = false;
            this.regenPipes = true;
            this.paused = false;
            this.prevTime = NaN; // we could have come from the paused state, we need to update prevTime
            this.cameraUpdate = true;
            this.flappyStopped = false;
            this.flappyVisible = true;
            this.groundVisible = true;

            if (prevState !== STATE_PAUSED) {
                // regen pipes
                for (var i = 0; i < NUM_PIPES; i++) {
                    this.pipes[i].passed = true;
                    this.pipes[i].x = -200;
                }
                this.pipeMax = this.bird.posX + Math.max(800, this.canvas.width);
            }

        } else if (this.state === STATE_PAUSED) {
            this.buttons = [this.buttonTrolleymanOrg, this.buttonPlay];
            this.deadFlappyImage = false;
            this.gravity = GRAVITY;
            this.oscillate = false;
            this.regenPipes = true;
            this.paused = true;
            this.cameraUpdate = true;
            this.flappyVisible = true;
            this.groundVisible = true;

        } else if (this.state === STATE_DEATH) {
            this.buttons = [this.buttonTrolleymanOrg, this.buttonRestartDeath, this.buttonLeaderboard];
            this.deadFlappyImage = true;
            this.gravity = GRAVITY;
            this.oscillate = false;
            this.regenPipes = true;
            this.newBestScore = false;
            this.cameraUpdate = true;
            this.flappyVisible = true;
            this.groundVisible = true;
            this.flappyStopped = true;
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.newBestScore = true;
                this.submitted = false;
                this.errorSubmitting = false;
                setBestScore(this.bestScore);
            }
            this.bird.velY = 300;

        } else if (this.state === STATE_LEADERBOARD) {
            this.buttons = [this.buttonTrolleymanOrg, this.buttonRestartLeaderboard, this.buttonSubmit];
            this.deadFlappyImage = true;
            this.gravity = GRAVITY;
            this.oscillate = false;
            this.regenPipes = true;
            this.leaderboard = [];
            this.leaderboardLoading = true;
            this.cameraUpdate = true;
            this.flappyVisible = true;
            this.groundVisible = true;

            const successFunction = (leaderboard: LeaderboardEntry[]) => {
                this.leaderboard = leaderboard;
                this.leaderboardLoading = false;
                console.log("Leaderboard loaded (" + leaderboard.length + " entries)");
                console.log("Leaderboard: " + JSON.stringify(leaderboard));
                if (this.newBestScore) {
                    // find if the user fits on the leaderboard
                    let pos = -1;
                    for (let i = 0; i < NUM_LEADERBOARD_ENTRIES; i++) {
                        const e = leaderboard[i];
                        if (typeof e === "undefined" || this.bestScore > e.score) {
                            pos = i;
                            break;
                        }
                    }

                    if (pos !== -1) {
                        this.leaderboardPos = pos;
                        leaderboard.splice(pos, 0, { user: true, name: "", score: this.bestScore });
                        this.beginTextEntryMode(MAX_NAME_LENGTH, isValidNameChar, this.buttonSubmit.activate.bind(this.buttonSubmit));
                    }
                }
            };
            const errorFunction = (err: string) => {
                console.log("Error loading leaderboard: " + err);
                this.state = STATE_LEADERBOARD_ERROR;
            };

            getLeaderboard().then(successFunction).catch(errorFunction);

        } else if (this.state === STATE_LEADERBOARD_ERROR) {
            this.buttons = [this.buttonTrolleymanOrg, this.buttonRestartLeaderboardError, this.buttonRetry];
            this.deadFlappyImage = true;
            this.gravity = GRAVITY;
            this.oscillate = false;
            this.regenPipes = true;
            this.cameraUpdate = true;
            this.flappyVisible = true;
            this.groundVisible = true;

        } else if (this.state === STATE_ERROR) {
            this.buttons = [this.buttonTrolleymanOrg];
            this.paused = true; // no updates
            this.flappyi = 0;
            this.regenPipes = false;
            this.cameraUpdate = false;
            this.flappyVisible = false;
            this.groundVisible = false;

        } else if (this.state === STATE_FINISHED) {
            this.buttons = [this.buttonTrolleymanOrg];
            this.paused = true; // no updates
            this.flappyi = 0;
            this.regenPipes = false;
            this.cameraUpdate = false;
            this.flappyVisible = false;
            this.groundVisible = false;

        } else {
            console.log("Error: Invalid state: " + this.state);
            this.state = STATE_START;
        }
    }

    mainLoop(): void {
        if (this.state === STATE_FINISHED) return;

        window.requestAnimationFrame(this.mainLoop.bind(this));
        // process key presses
        this.processKeys();

        // update
        this.update();

        // draw
        this.draw();

        // reset keys pressed since last frame
        this.keyUps = [];
        this.keyDowns = [];
    }

    beginTextEntryMode(maxLength?: number, isLegalChar?: (c: string) => boolean, submitFunction?: () => void): void {
        this.usernameEntry.value = "";
        if (typeof maxLength === "undefined")
            maxLength = 32;
        if (typeof isLegalChar === "undefined")
            isLegalChar = function (c: string) { return true; };

        this.usernameEntry.onkeypress = (e: KeyboardEvent) => {
            const s = String.fromCharCode(e.charCode);
            if (typeof submitFunction !== "undefined" && e.code.toLowerCase() === 'enter') {
                submitFunction();
            }
            for (let i = 0; i < s.length; i++)
                if (!isLegalChar!(s[i])) {
                    e.preventDefault();
                    break;
                }
        };

        this.usernameEntry.maxLength = maxLength;
        this.usernameEntry.style.visibility = "visible";
        this.usernameEntry.focus();
    }

    endTextEntryMode(): void {
        this.usernameEntry.style.visibility = "hidden";
    }

    processKeys(): void {
        for (let i = 0; i < this.keyDowns.length; i++) {
            const e = this.keyDowns[i];
            const which = e.which;
            const key = e.key; // key is 'w', 'W', '!', etc.
            const code = e.code; // code is 'Escape', 'KeyW', 'Digit1', etc.

            if (which === WHICH_CODE_SPACE) {
                this.flap();
            }
            if (code === "Escape" && (this.debugAllowed || this.state === STATE_PLAYING || this.state === STATE_PAUSED)) {
                this.togglePause();
            }
            if (code === "Digit1" && this.debugAllowed) {
                this.debugView = !this.debugView;
            }
            if (code === "Digit2" && this.debugAllowed) {
                this.cameraUpdate = !this.cameraUpdate;
            }

            console.log("Key pressed: " + which + " '" + key + "' (" + code + ")");
        }
    }

    pause(): void {
        if (this.state === STATE_PLAYING) {
            this.state = STATE_PAUSED;
        } else {
            this.paused = true;
        }
    }

    unpause(): void {
        if (this.state === STATE_PAUSED) {
            this.state = STATE_PLAYING;
        } else {
            this.paused = false;
            this.prevTime = NaN;
        }
    }

    togglePause(): void {
        if (this.state === STATE_PLAYING) {
            this.state = STATE_PAUSED;
        } else if (this.state === STATE_PAUSED) {
            this.state = STATE_PLAYING;
        } else {
            this.paused = !this.paused;
            if (!this.paused)
                this.prevTime = NaN;
        }
    }

    press(x: number, y: number): void {
        const bs = this.buttons;
        for (let i = 0; i < bs.length; i++) {
            bs[i].handleClick(x, y);
        }
    }

    update(): void {
        if (this.paused)
            return;

        // calculate timings
        const now = Date.now().valueOf();
        if (isNaN(this.prevTime)) {
            this.prevTime = now;
        }
        const dt = (now - this.prevTime) / 1000.0;
        this.prevTime = now;

        // update flappy frame #
        if (this.state === STATE_START || this.state === STATE_PLAYING)
            this.flappyi = (this.flappyi + (dt / this.flappyDt)) % this.imgs.flappy.length;

        // update bird
        this.updateFlappy(dt);

        // check pipes. regen if not valid. add to score if passed.
        if (this.regenPipes) {
            for (let i = 0; i < this.pipes.length; i++) {
                const pipe = this.pipes[i];
                if (!pipe.passed && pipe.x + this.imgs.pipeHead.width / 2 < this.bird.posX) {
                    // score pipe
                    this.score += 1;
                    pipe.passed = true;
                }
                if (pipe.x + this.imgs.pipeHead.width < this.cameraX) {
                    // not valid pipe, reuse.
                    pipe.reuse(this.pipeMax, this.getPipeY());
                    this.pipeMax += PIPE_SPACING_X;
                }
            }
        }
    }

    flap(): void {
        if (this.state === STATE_START || this.state === STATE_PLAYING)
            this.bird.velY = MAX_VEL_Y;

        if (this.state === STATE_START)
            this.state = STATE_PLAYING;
    }

    updateFlappy(dt: number): void {
        const bird = this.bird;

        bird.velY += dt * this.gravity;

        if (this.oscillate) {
            // oscillate around a point if in start mode
            bird.t += dt;
            bird.t %= Math.PI * 2;
            bird.velY = Math.cos(bird.t * 4) * 70;
        }
        // if on the ground
        const h = this.imgs.ground.height + this.flappyCurrent.height / 2;
        if (bird.posY <= h && bird.velY < 0) {
            bird.velY = 0;
        }
        if (bird.posY <= h) {
            bird.posY = h;
            if (this.state === STATE_PLAYING)
                this.state = STATE_DEATH;
        }
        // if at the top of the screen
        const ch = this.canvas.height;
        const t = this.flappyCurrent.height / 2;
        if (bird.posY + t > ch) {
            bird.posY = ch - t;
            bird.velY = 0;
        }

        // Update velocity
        if (this.flappyStopped) {
            bird.velX = 0;
        } else {
            const nearestPipeDiffX = Math.min.apply(null, this.pipes.filter(v => v.x > this.bird.posX).map(v => v.x)) - this.bird.posX;
            if (nearestPipeDiffX > 250 && nearestPipeDiffX < 10000) {
                bird.velX = Math.min(600, 150 + (nearestPipeDiffX - 250) / 1);
            } else {
                bird.velX = 150;
            }
        }

        // Update positions using velocity
        bird.posX += dt * bird.velX;
        bird.posY += dt * bird.velY;

        // bird angle logic
        bird.ang = calculateAngle(bird.velX, bird.velY);
        bird.ang = (bird.ang - bird.prevAng) * Math.min(1, 15 * dt) + bird.prevAng; // lerp
        bird.prevAng = bird.ang;

        if (this.state === STATE_START || this.state === STATE_PLAYING) {
            // check for collisions with pipes. if a collision is found, kill the bird
            const bb = bird.getBB(this.flappyCurrent.width, this.flappyCurrent.height);
            for (let i = 0; i < this.pipes.length; i++) {
                const pipe = this.pipes[i];

                // if pipe is nearby, collision check
                const bmax = bb.x + bb.w / 2, bmin = bb.x - bb.w / 2;
                const pmax = pipe.x + this.imgs.pipeHead.width, pmin = pipe.x;
                if (bmin > pmax || bmax < pmin)
                    continue; // skip since pipe is not nearby

                const ru = pipe.bbUpper(this.imgs.pipeHead.width);
                const rl = pipe.bbLower(this.imgs.pipeHead.width);

                let intersected = false;
                if (bb.intersects(ru)) {
                    console.log("bird intersects with pipe " + i + " (UPPER)");
                    intersected = true;
                } else if (bb.intersects(rl)) {
                    console.log("bird intersects with pipe " + i + " (LOWER)");
                    intersected = true;
                }
                if (intersected) {
                    this.state = STATE_DEATH;
                }
            }
        }
    }

    draw(): void {
        // resize canvas
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        // If it's resolution does not match change it
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        // get context
        const c = this.canvas.getContext("2d")!;
        // clear canvas - don't technically need this, but it's nice
        c.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // we want that pixel-y feel!
        c.imageSmoothingEnabled = false;

        // the camera is always at the bird pos.
        if (this.cameraUpdate)
            this.cameraX = this.bird.posX - 60 - this.canvas.width / 20.0;

        // if debugging is off, hide the stats panel
        if (this.debugView) {
            this.drawStats();
        } else {
            this.stats.style.visibility = "hidden";
        }

        if (this.groundVisible) {
            // draw blank background first
            drawImageTiled(c, this.imgs.bgBlank);
            // draw textured background
            const offsetBg = -this.imgs.bg.width - ((this.cameraX / 2) % this.imgs.bg.width);
            drawImageTiled(c, this.imgs.bg, offsetBg, this.canvas.height - this.imgs.bg.height, undefined, 1);

            // draw pipes
            for (let i = 0; i < this.pipes.length; i++) {
                this.drawPipe(c, this.pipes[i]);
            }

            // draw ground
            const offsetGround = -this.imgs.ground.width - (this.cameraX % this.imgs.ground.width);
            drawImageTiled(c, this.imgs.ground, offsetGround, this.canvas.height - this.imgs.ground.height, undefined, 1);
        }

        // draw flappy bird
        if (this.flappyVisible)
            this.drawFlappy(c);

        // draw score
        this.drawUI(c);
    }

    drawUI(c: CanvasRenderingContext2D): void {
        // draw loading screen
        if (this.state === STATE_LOADING)
            this.drawLoadingUI(c);

        // draw start screen
        if (this.state === STATE_START)
            this.drawStartUI(c);

        // draw score
        if (this.state === STATE_PLAYING || this.state === STATE_PAUSED)
            this.drawPlayingUI(c);

        // draw death screen
        if (this.state === STATE_DEATH)
            this.drawDeathUI(c);

        // draw leaderboard screen
        if (this.state === STATE_LEADERBOARD)
            this.drawLeaderboardUI(c);

        if (this.state === STATE_LEADERBOARD_ERROR)
            this.drawLeaderboardErrorUI(c);

        if (this.state === STATE_ERROR)
            this.drawErrorUI(c);

        // draw buttons
        const bs = this.buttons;
        for (let i = 0; i < bs.length; i++) {
            const btn = bs[i];
            btn.draw(c, this.debugView, this.mousePos || undefined);
        }
    }

    drawLoadingUI(c: CanvasRenderingContext2D): void {
        const x = c.canvas.width / 2;
        const y = c.canvas.height / 2;
        if (this.flappysLoaded)
            this.drawLoadingAnimation(c, this.stateChangeDt, x, y, false);
    }

    drawPlayingUI(c: CanvasRenderingContext2D): void {
        c.textAlign = "left";
        c.textBaseline = "top";
        c.font = "30px FlappyFont, sans-serif";
        drawFlappyText(c, this.score.toString(), this.getScoreOffsetX(), this.getScoreOffsetY(), "white", 2);
    }

    drawStartUI(c: CanvasRenderingContext2D): void {
        drawImage(c, this.imgs.tapInfo,
            this.getTapInfoOffsetX() + this.bird.posX - this.cameraX,
            //200 + this.canvas.width / 20.0 - this.imgs.tapInfo.width/2,
            (this.canvas.height - this.getBirdStartY()) - this.imgs.tapInfo.height / 2);

        c.textAlign = "center";
        c.textBaseline = "top";
        c.font = "60px FlappyFont, sans-serif";
        const x = Math.floor(this.canvas.width / 2);
        const col = "gold";//"#30e830";
        drawFlappyText(c, "Flappy", x, this.getTitleStartY(), col);
        drawFlappyText(c, "Clone", x, this.getTitleStartY() + 60 + 20, col);
    }

    drawDeathUI(c: CanvasRenderingContext2D): void {
        c.textAlign = "center";
        c.textBaseline = "top";
        c.font = "60px FlappyFont, sans-serif";
        const titleCol = "gold";
        if (!this.isGameOverMultiline()) {
            drawFlappyText(c, "Game Over", Math.floor(c.canvas.width / 2), this.getGameOverY(), titleCol);
        } else {
            drawFlappyText(c, "Game", Math.floor(c.canvas.width / 2), this.getGameOverY(), titleCol);
            drawFlappyText(c, "Over", Math.floor(c.canvas.width / 2), this.getGameOverY2(), titleCol);
        }

        c.font = "30px FlappyFont, sans-serif";
        const diff = 70;
        const l = Math.floor(c.canvas.width / 2 - diff);
        const r = Math.floor(c.canvas.width / 2 + diff);
        const t = this.getGameOverTop();
        const b = this.getGameOverBottom();
        const outline = 3;
        drawFlappyText(c, "Score", l, t, "white", outline);
        drawFlappyText(c, "Best", r, t, "white", outline);
        drawFlappyText(c, this.score.toString(), l, b, "white", outline);
        drawFlappyText(c, this.bestScore.toString(), r, b, "white", outline);

        if (this.newBestScore)
            drawImage(c, this.imgs.new, r + 27, t - 10);
    }

    drawLeaderboardUI(c: CanvasRenderingContext2D): void {
        this.drawLeaderboardHeader(c);
        if (this.leaderboardLoading) {
            var x = c.canvas.width / 2;
            var y = c.canvas.height / 2;
            this.drawLoadingAnimation(c, this.stateChangeDt, x, y, true);
        } else {
            this.drawLeaderboard(c);
        }
    }

    drawLeaderboardErrorUI(c: CanvasRenderingContext2D): void {
        const img = this.imgs.deadFlappy[2];
        const offsetX = -img.width / 2;
        const offsetY = -img.height / 2;
        const x = c.canvas.width / 2;
        const y = 345;

        c.translate(x, y);
        c.rotate(Math.PI);
        drawImage(c, img, offsetX, offsetY);
        c.rotate(-Math.PI);
        c.translate(-x, -y);

        c.textAlign = "center";
        c.textBaseline = "top";
        c.font = "60px FlappyFont, sans-serif";
        drawFlappyText(c, "Error", x, 110, "red");
        var spacing = 50, startY = 210;
        c.font = "30px FlappyFont, sans-serif";
        drawFlappyText(c, "The leaderboard could", x, startY, "white", 3)
        drawFlappyText(c, "not be loaded.", x, startY + spacing, "white", 3)
    }

    drawErrorUI(c: CanvasRenderingContext2D): void {
        const img = this.imgs.deadFlappy[2];
        const offsetX = -img.width / 2;
        const offsetY = -img.height / 2;
        const x = c.canvas.width / 2;
        const y = 275;

        c.translate(x, y);
        c.rotate(Math.PI);
        drawImage(c, img, offsetX, offsetY);
        c.rotate(-Math.PI);
        c.translate(-x, -y);

        c.textAlign = "center";
        c.textBaseline = "top";
        c.font = "50px FlappyFont, sans-serif";
        drawFlappyText(c, "Error", x, y + 50, "red");
        c.font = "25px FlappyFont, sans-serif";
        drawFlappyText(c, this.errorMessage || "Unknown error.", x, y + 125, "white", 2)
    }

    drawLeaderboardHeader(c: CanvasRenderingContext2D): void {
        c.textAlign = "center";
        c.textBaseline = "top";
        c.font = this.getLeaderboardHeaderFontSize() + "px FlappyFont, sans-serif";
        const titleCol = "gold";
        drawFlappyText(c, "Leaderboard", Math.floor(c.canvas.width / 2), this.getLeaderboardHeaderY(), titleCol, this.getLeaderboardHeaderFontOutline());
    }

    drawLeaderboard(c: CanvasRenderingContext2D): void {
        c.textBaseline = "top";
        c.font = this.getLeaderboardFontSize() + "px FlappyFont, sans-serif";

        const totalW = Math.min(c.canvas.width, MAX_LEADERBOARD_WIDTH);

        const left = c.canvas.width / 2 - totalW / 2;
        const right = c.canvas.width - left;
        const outline = this.getLeaderboardFontOutline();
        const scoreW = c.measureText("SCORE").width;

        const numX = left + this.getLeaderboardLeftOffset();
        const spacing = 8;
        const x = right - this.getLeaderboardRightOffset();
        let y = this.getLeaderboardY();
        const titleCol = "gold";

        c.textAlign = "right";
        drawFlappyText(c, "NAME", x - spacing, y, titleCol, outline);
        drawFlappyText(c, "#", numX, y, titleCol, outline);
        c.textAlign = "left";
        drawFlappyText(c, "SCORE", x + spacing, y, titleCol, outline);
        const scoreX = x + spacing + scoreW / 2;

        for (let i = 0; i < NUM_LEADERBOARD_ENTRIES; i++) {
            const e = this.leaderboard[i];
            if (typeof e === "undefined")
                break;

            let col = "white";
            const hide = Math.floor((5 * this.stateChangeDt) % 3) === 0;
            if (e.user && this.errorSubmitting) {
                // Error submitting
                col = "red";
            } else if (e.user) {
                // Highlight current user
                col = "gold";
            }

            y += this.getLeaderboardEntrySpacing();
            c.textAlign = "right";
            const space = x - 2 * spacing - numX;
            if (this.submitting && e.user) {
                const now = Date.now().valueOf() / 1000.0;
                const dt = now - this.submittingStartTime;
                const dots = Math.floor(((2 * dt) % 3) + 1);
                const text = ".".repeat(dots);

                drawFlappyText(c, text, x - spacing, y, col, outline);
            } else if (this.errorSubmitting && e.user) {
                drawFlappyText(c, "ERROR", x - spacing, y, col, outline);
            } else if (e.user && !this.submitted) {
                if (this.usernameEntry.style.visibility === "visible") {
                    this.usernameEntry.style.fontSize = this.getLeaderboardFontSize() + "px";
                    this.usernameEntry.style.width = space + "px";
                    this.usernameEntry.style.left = (x - spacing - space) + "px";
                    this.usernameEntry.style.right = (x - spacing) + "px";
                    this.usernameEntry.style.top = (y - 4) + "px";
                }
            } else {
                drawFlappyText(c, e.name, x - spacing, y, col, outline, space, false);
            }
            drawFlappyText(c, (i + 1) + ".", numX, y, col, outline);
            c.textAlign = "center";
            drawFlappyText(c, e.score.toString(), scoreX, y, col, outline);
        }
    }

    drawLoadingAnimation(c: CanvasRenderingContext2D, dt: number, x: number, y: number, drawText: boolean): void {
        const ang = (5 * dt) % (2 * Math.PI);
        const i = (15 * dt) % this.imgs.flappy.length;
        const dots = Math.floor(((2 * dt) % 3) + 1);
        const img = this.imgs.flappy[Math.floor(i)];

        if (drawText) {
            const text = ".".repeat(dots);

            c.textAlign = "center";
            c.textBaseline = "bottom";
            c.font = "30px FlappyFont, sans-serif";
            drawFlappyText(c, text, x, y + 8, "white", 2);
        }

        const radius = -35;
        const offsetX = -img.width / 2;
        const offsetY = -img.height / 2;

        c.translate(x, y);
        c.rotate(ang);
        c.translate(0, radius);
        drawImage(c, img, offsetX, offsetY);
        c.translate(0, -radius);
        c.rotate(-ang);
        c.translate(-x, -y);
    }

    drawStats(): void {
        this.stats.style.visibility = "visible";

        let html = "";
        html += "Score: " + this.score + "<br>";
        html += "Paused: " + this.paused + "<br>";
        html += "State: " + stateToString(this.state) + "<br>";
        html += "PosX: " + this.bird.posX.toFixed(2) + "<br>";
        html += "PosY: " + this.bird.posY.toFixed(2) + "<br>";
        html += "VelX: " + this.bird.velX.toFixed(2) + "<br>";
        html += "VelY: " + this.bird.velY.toFixed(2) + "<br>";
        html += "Gravity: " + this.gravity;

        this.stats.innerHTML = html;
    }

    drawFlappy(c: CanvasRenderingContext2D): void {
        // draw flappy bird
        const x = this.bird.posX - this.cameraX;
        const y = c.canvas.height - this.bird.posY;
        const ang = this.bird.ang;

        if (this.debugView) {
            // Draw velocity vector
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x + this.bird.velX, y - this.bird.velY);
            c.strokeStyle = "black";
            c.stroke();

            // draw path
            if (this.state !== STATE_START) {
                c.beginPath();
                c.moveTo(x, y);
                const stepSize = 10;
                for (let i = 0; i < 300; i += stepSize) { // predict path 200 pixels in front
                    const t = i / this.bird.velX;
                    // s = ut + (1/2)at^2
                    const s = this.bird.velY * t + 0.5 * this.gravity * t * t;
                    c.lineTo(x + i, y - s);
                }
                c.strokeStyle = "red";
                c.stroke();
            }
        }

        // center x & y
        const img = this.flappyCurrent;
        const offsetX = -img.width / 2;
        const offsetY = -img.height / 2;

        c.translate(x, y);
        c.rotate(ang);
        c.translate(offsetX, offsetY);
        drawImage(c, img, 0, 0);
        c.translate(-offsetX, -offsetY);
        c.rotate(-ang); // faster than c.save(); c.restore();
        c.translate(-x, -y);
        if (this.debugView) {
            const r = this.bird.getBB(this.flappyCurrent.width, this.flappyCurrent.height);
            r.x -= this.cameraX;
            c.strokeStyle = "green";
            r.draw(c);
        }
    }

    drawPipe(c: CanvasRenderingContext2D, pipe: Pipe): void {
        const x = pipe.x - this.cameraX;
        const ly = c.canvas.height - pipe.y;
        const uy = ly - pipe.spacing;

        // draw upper pipe
        c.scale(1, -1);
        drawImageTiled(c, this.imgs.pipe, x, -uy, 1, undefined);
        drawImage(c, this.imgs.pipeHead, x, -uy);
        c.scale(1, -1);

        // draw lower pipe
        drawImageTiled(c, this.imgs.pipe, x, ly, 1, undefined);
        drawImage(c, this.imgs.pipeHead, x, ly);

        if (this.debugView) {
            const ru = pipe.bbUpper(this.imgs.pipeHead.width);
            ru.x -= this.cameraX;
            const rl = pipe.bbLower(this.imgs.pipeHead.width);
            rl.x -= this.cameraX;
            c.strokeStyle = "blue";
            ru.draw(c);
            rl.draw(c);

            c.beginPath();
            c.rect(x + this.imgs.pipeHead.width / 4 * 1.5, uy, this.imgs.pipeHead.width / 4, pipe.spacing);
            c.strokeStyle = "gold";
            c.stroke();
        }
    }

    getCanvasHeight(): number {
        return this.canvas.height;
    }

    getCanvasWidth(): number {
        return this.canvas.width;
    }

    getHeightRatio(): number {
        const minCanvasHeight = 480;
        const maxCanvasHeight = 915;
        return (Math.min(Math.max(this.getCanvasHeight(), minCanvasHeight), maxCanvasHeight) - minCanvasHeight) / (maxCanvasHeight - minCanvasHeight);
    }

    getWidthRatio(): number {
        const minCanvasWidth = 320;
        const maxCanvasWidth = 1440;
        return (Math.min(Math.max(this.getCanvasWidth(), minCanvasWidth), maxCanvasWidth) - minCanvasWidth) / (maxCanvasWidth - minCanvasWidth);
    }

    getAverageRatio(): number {
        return (this.getWidthRatio() + this.getHeightRatio()) / 2;
    }

    getPipeY(): number {
        const rand = Math.random();
        const min = rand * 150 + 120;
        const max = rand * 300 + 200;

        return lerp(min, max, this.getHeightRatio());
    }

    getBirdStartY(): number {
        return lerp(170, 350, this.getHeightRatio());
    }

    getTapInfoOffsetX(): number {
        return lerpFloor(80, 120, this.getWidthRatio());
    }

    getTitleStartY(): number {
        return lerpFloor(60, 150, this.getHeightRatio());
    }

    getPaddingOffset() : number {
        return lerpFloor(20, 50, this.getAverageRatio());
    }

    getTopButtonOffset(): number {
        return this.getPaddingOffset();
    }

    getLeftButtonOffset(): number {
        return this.getPaddingOffset();
    }

    getTopLeftButtonOffset(): number {
        return this.getPaddingOffset();
    }

    getRightButtonOffset(): number {
        return this.getCanvasWidth() - this.getPaddingOffset()
    }

    getPauseButtonOffsetX(): number {
        return this.getRightButtonOffset() - this.imgs.buttonPause.width;
    }

    getPauseButtonOffsetY(): number {
        return this.getTopButtonOffset();
    }

    getScoreOffsetX(): number {
        return this.getPauseButtonOffsetX() - 30;
    }

    getScoreOffsetY(): number {
        return this.getTopButtonOffset();
    }

    isGameOverMultiline(): boolean {
        return this.getCanvasWidth() < 350;
    }

    getGameOverY(): number {
        return lerpFloor(50, 200, this.getHeightRatio());
    }

    getGameOverY2(): number {
        return this.getGameOverY() + 60 + 20;
    }

    getGameOverTop(): number {
        return lerpFloor(240, 290, this.getHeightRatio());
    }

    getGameOverBottom(): number {
        return this.getGameOverTop() + 50;
    }

    getGameOverButtonsY(): number {
        return lerpFloor(365, 400, this.getHeightRatio());
    }

    leaderboardHelper(smaller: number, min: number, max: number): number {
        if (this.getCanvasHeight() < LEADERBOARD_SMALLER_THRESHOLD_HEIGHT) {
            return smaller;
        } else if (this.getCanvasWidth() >= LEADERBOARD_THRESHOLD_WIDTH && this.getCanvasHeight() >= LEADERBOARD_THRESHOLD_HEIGHT) {
            return max;
        } else {
            return min;
        }
    }

    getLeaderboardHeaderFontSize(): number {
        return this.leaderboardHelper(35, 45, 60);
    }

    getLeaderboardFontSize(): number {
        return this.leaderboardHelper(15, 20, 30);
    }

    getLeaderboardHeaderFontOutline(): number {
        return this.leaderboardHelper(3, 4, 5);
    }

    getLeaderboardFontOutline(): number {
        return this.leaderboardHelper(1, 2, 3);
    }

    getLeaderboardHeaderY(): number {
        return lerpFloor(20, 110, this.getHeightRatio());
    }

    getLeaderboardButtonsY(): number {
        const y = this.getLeaderboardHeaderY();
        return y + this.leaderboardHelper(320, 420, 540);
    }

    getLeaderboardY(): number {
        return this.getLeaderboardHeaderY()
            + this.getLeaderboardHeaderFontSize()
            + this.getLeaderboardHeaderFontOutline() * 2
            + 10;
    }

    getLeaderboardLeftOffset(): number {
        return this.leaderboardHelper(30, 40, 60);
    }

    getLeaderboardRightOffset(): number {
        return this.leaderboardHelper(60, 80, 130);
    }

    getLeaderboardEntrySpacing(): number {
        return this.leaderboardHelper(20, 30, 40);
    }
}