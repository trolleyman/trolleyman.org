
# trolleyman.org
[trolleyman.org](https://trolleyman.org) is my personal website, and this repo contains all the code to make it work.

## Development
The nightly `cargo` and `rustc` are needed as prerequisites.

To install them first install `rustup` via. the [Rust website](https://www.rust-lang.org/tools/install), and then run `rustup default nightly`.

After that, run this in the root of the repo:
```
cargo xtask run
```

The dependencies should be downloaded, compiled, built, and the server should be run at [http://localhost:8000](http://localhost:8000).

## Main URLs
### `/`: [trolleyman.org](https://trolleyman.org)
Small personal website, displaying some projects that I've worked on over the years.

### `/flappy`: FlappyClone
A fully responsive HTML5 canvas-based Flappy Bird clone with a global leaderboard.

<img src="screenshots/start.png" width="210px" /> <img src="screenshots/playing.png" width="210px" /> <img src="screenshots/death.png" width="210px" /> <img src="screenshots/leaderboard.gif" width="210px" />

#### Controls
Space or click/tap on the screen to flap.

### `/linc`: LINC
A small project completed for Millenium Point.

### `/git_hook`
The [git_hook/push endpoint](django/git_hook) can be used to automatically update the server every time a branch is updated on GitHub.
For example, [trolleyman.org](https://trolleyman.org) is hooked up to restart when the [`prod`](https://github.com/trolleyman/trolleyman.org/tree/prod) branch of this repo is updated.
