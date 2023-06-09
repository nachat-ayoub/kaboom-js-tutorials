kaboom({
  background: [61, 57, 92],
});

const CAM_SCALE = 1.8;
const JUMP_FORCE = 420;
const GRAVITY = 1200;

setGravity(GRAVITY);
function game() {
  return {
    height: height() / CAM_SCALE,
    width: width() / CAM_SCALE,
  };
}

camPos(game().width / 2, game().height / 2);
camScale(CAM_SCALE, CAM_SCALE);

loadRoot('/assets/');
loadSprite('terrain', 'terrain.png');
loadSprite('dust-particle', 'particles/dust.png');
loadSpriteAtlas('ninja-frog/all.png', {
  player: {
    x: 0,
    y: 0,
    width: 384,
    height: 192,
    sliceX: 12,
    sliceY: 6,
    anims: {
      idle: { speed: 20, from: 0, to: 10, loop: true },
      run: { speed: 20, from: 12, to: 23, loop: true },
      doubleJump: { speed: 20, from: 48, to: 53 },
      jump: { speed: 20, from: 60, to: 60 },
      fall: { speed: 20, from: 61, to: 61 },
      wallJump: { speed: 20, from: 24, to: 28 },
      hit: { speed: 20, from: 36, to: 42 },
    },
  },
});

add([
  'ground',
  sprite('terrain'),
  anchor('botleft'),
  pos(0, game().height),
  area(),
  body({ isStatic: true }),
]);
add([
  'ground',
  sprite('terrain'),
  anchor('botleft'),
  pos(0, game().height * 0.6),
  area(),
  body({ isStatic: true }),
]);

add([
  'ground',
  sprite('terrain'),
  anchor('botleft'),
  pos(game().width / 2, game().height - 50),
  area(),
  body({ isStatic: true }),
]);

const player = add([
  'player',
  sprite('player'),
  pos(0, 0),
  area(),
  body(),
  doubleJump(2),
  {
    speed: 100,
    lastAnim: '',
    isNormalJump: null,
  },
]);

// * PLayer movement :
onKeyDown('right', () => {
  player.move(player.speed, 0);
  player.flipX = false;
});

onKeyDown('left', () => {
  player.move(-player.speed, 0);
  player.flipX = true;
});

onKeyPress('up', () => {
  player.doubleJump(JUMP_FORCE);
  if (player.isNormalJump) {
    player.play('jump');
  }
});

player.onDoubleJump(() => {
  player.isNormalJump = false;
  player.play('doubleJump');
});

player.add([
  'particle',
  sprite('dust-particle'),
  z(5),
  pos(
    player.curAnim() == 'left' ? player.x - 16 : player.x + player.width + 16,
    player.y
  ),
]);

player.onUpdate(() => {
  if (!player.isGrounded() && !player.isJumping() && player.isFalling()) {
    player.play('fall');
  }
});

player.onGround(() => {
  makeDustParticle(true);
  player.isNormalJump = true;

  if (isKeyDown('left')) player.play('run');
  else if (isKeyDown('right')) player.play('run');
  else player.play('idle');
});

onKeyPress('right', () => {
  if (player.isGrounded) {
    player.play('run');
  }
});
onKeyPress('left', () => {
  if (player.isGrounded) {
    player.play('run');
  }
});

onKeyRelease('right', () => player.play('idle'));
onKeyRelease('left', () => player.play('idle'));

const makeDustParticle = (fall = false) => {
  function scaleFadeOutParticle(obj, _speed = 0.04) {
    const s = vec2(obj.scale.x - _speed);
    if (s.x < 0) {
      return obj.destroy();
    } else obj.scale = vec2(s);
  }

  if (fall) {
    const dustParticleRight = add([
      'particle',
      sprite('dust-particle'),
      z(6),
      anchor('center'),
      pos(player.pos.x + 8, player.pos.y + player.height),
      area({ collisionIgnore: ['particle'] }),
      scale(1),
      opacity(1),
      lifespan(0.1, { fade: 0.2 }),
    ]);
    const dustParticleLeft = add([
      'particle',
      sprite('dust-particle'),
      z(6),
      anchor('center'),
      pos(player.pos.x + player.width - 8, player.pos.y + player.height),
      area({ collisionIgnore: ['particle'] }),
      scale(1),
      opacity(1),
      lifespan(0.1, { fade: 0.2 }),
    ]);

    dustParticleRight.onUpdate(() => {
      scaleFadeOutParticle(dustParticleRight);
    });
    dustParticleLeft.onUpdate(() => {
      scaleFadeOutParticle(dustParticleLeft);
    });
  } else {
    const dustParticle = add([
      'particle',
      sprite('dust-particle'),
      z(6),
      anchor('center'),
      pos(
        player.curAnim() == 'run' && !player.flipX
          ? player.pos.x + 8
          : player.pos.x + player.width - 8,
        player.pos.y + player.height
      ),
      area({ collisionIgnore: ['particle'] }),
      scale(1),
      opacity(1),
      lifespan(0.1, { fade: 0.2 }),
    ]);

    dustParticle.onUpdate(() => {
      scaleFadeOutParticle(dustParticle);
    });
  }
};

loop(0.2, () => {
  if (!['idle', 'fall'].includes(player.curAnim())) {
    makeDustParticle();
  }
});
