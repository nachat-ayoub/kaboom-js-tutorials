kaboom({
  background: [61, 57, 92],
});
// debug.inspect = true;

function toggleInspectMode() {
  const inspectMode = debug.inspect || false;
  debug.inspect = !inspectMode;
}
onKeyPress('a', toggleInspectMode);

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

loadRoot(window.location.href?.split('?')[0] + '/assets/');
loadSprite('terrain', 'terrain.png');
loadSprite('dust-particle', 'particles/dust.png');

loadSpriteAtlas('fruits/Collected.png', {
  fruitCollected: {
    x: 0,
    y: 0,
    width: 192,
    height: 32,
    sliceX: 6,
    anims: {
      collected: { speed: 20, from: 0, to: 5 },
    },
  },
});

function loadFruitSprite(fruit) {
  loadSpriteAtlas(`fruits/${fruit}.png`, {
    [fruit]: {
      x: 0,
      y: 0,
      width: 544,
      height: 32,
      sliceX: 17,
      anims: {
        idle: { speed: 20, from: 0, to: 16, loop: true },
      },
    },
  });

  return fruit;
}

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
loadSpriteAtlas('trunk.png', {
  enemy: {
    x: 0,
    y: 0,
    width: 1152,
    height: 96,
    sliceX: 18,
    sliceY: 3,
    anims: {
      idle: { speed: 20, from: 0, to: 17, loop: true },
      run: { speed: 20, from: 18, to: 35, loop: true },
      attack: { speed: 20, from: 36, to: 46 },
      hit: { speed: 20, from: 47, to: 51 },
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
  pos(195, game().height * 0.8),
  area(),
  body({ isStatic: true }),
]);

add([
  'ground',
  sprite('terrain'),
  anchor('botleft'),
  pos(390, game().height * 0.6),
  area(),
  body({ isStatic: true }),
]);

const player = add([
  'player',
  sprite('player'),
  pos(67, 0),
  area({ scale: vec2(0.55, 0.73), offset: vec2(13, 10) }),
  body(),
  z(100),
  doubleJump(2),
  {
    speed: 100,
    isNormalJump: null,
  },
]);

const enemy = add([
  'enemy',
  sprite('enemy'),
  pos(200, 0),
  area({ scale: vec2(0.29, 0.73), offset: vec2(80, 10) }),
  body(),
  z(100),
  doubleJump(2),
  {
    speed: 100,
    dead: null,
  },
]);
enemy.play('idle');

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
  function scaleFadeOutParticle(obj, _speedX = 0.04, _speedY = 0.04) {
    const s = vec2(obj.scale.x - _speedX, obj.scale.y - _speedY);
    if (s.x < 0 || s.y < 0) {
      return obj.destroy();
    } else obj.scale = vec2(s);
  }

  if (fall && player.isGrounded()) {
    const dustParticleLeft = add([
      'particle',
      sprite('dust-particle'),
      z(6),
      anchor('center'),
      pos(player.pos.x + 8, player.pos.y + player.height),
      area({ collisionIgnore: ['particle'] }),
      scale(1, 0.9),
      opacity(0.6),
      lifespan(0.1, { fade: 0.1 }),
      move(190, 100),
    ]);
    const dustParticleRight = add([
      'particle',
      sprite('dust-particle'),
      z(6),
      anchor('center'),
      pos(player.pos.x + player.width - 8, player.pos.y + player.height),
      area({ collisionIgnore: ['particle'] }),
      scale(1, 0.9),
      opacity(0.6),
      lifespan(0.1, { fade: 0.1 }),
      move(-10, 100),
    ]);

    dustParticleRight.onUpdate(() => {
      scaleFadeOutParticle(dustParticleRight);
    });

    dustParticleLeft.onUpdate(() => {
      scaleFadeOutParticle(dustParticleLeft);
    });
  } else {
    const isRight = player.curAnim() == 'run' && !player.flipX;

    const dustParticle = add([
      'particle',
      sprite('dust-particle'),
      z(6),
      anchor('center'),
      pos(
        isRight ? player.pos.x + 8 : player.pos.x + player.width - 8,
        player.pos.y + player.height
      ),
      area({ collisionIgnore: ['particle'] }),
      scale(1),
      opacity(0.6),
      lifespan(0.1, { fade: 0.1 }),
    ]);

    dustParticle.onUpdate(() => {
      scaleFadeOutParticle(dustParticle);
    });
  }
};

loop(0.14, () => {
  if (!['idle', 'fall'].includes(player.curAnim())) {
    makeDustParticle();
  }
});

function spawnFruit(fruit, nb, { x, y }, spaceBetween = 25, horizontal = true) {
  spaceBetween = spaceBetween || 25;
  loadFruitSprite(fruit);

  new Array(nb).fill().map((_, i) => {
    let fruitX = !horizontal ? x : x + i * spaceBetween;
    let fruitY = horizontal ? y : y - i * spaceBetween;

    const fruitObj = add([
      'fruit',
      fruit,
      sprite(fruit),
      area({ scale: vec2(0.42), offset: vec2(22) }),
      pos(fruitX, fruitY),
    ]);

    fruitObj.play('idle');
  });
}

spawnFruit('Orange', 5, { x: 90, y: 240 }, null, false);

spawnFruit('Orange', 5, { x: 200, y: 180 });
spawnFruit('Orange', 4, { x: 210, y: 160 });

spawnFruit('Apple', 5, { x: 380, y: 100 });
spawnFruit('Apple', 4, { x: 390, y: 80 });

player.onCollide('fruit', (fruit) => {
  fruit.use(sprite('fruitCollected'));
  fruit.play('collected');
  fruit.onAnimEnd((anim) => {
    fruit.destroy();
  });
});

onCollide('enemy', 'player', (enemy, player, collision) => {
  if (enemy.dead === null || enemy.dead) {
    if (collision.isTop() && !enemy.dead) {
      console.log('enemy dead');
      enemy.play('hit');
    } else {
      player.play('hit');
      enemy.dead = true;
      console.log('player dead');
    }
  }
});
