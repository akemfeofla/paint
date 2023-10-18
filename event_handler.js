// js/event_handler.js

// 도형 생성 이벤트 핸들러
function handleCreateObject(event) {
  event.preventDefault();

  const canvas = document.querySelector('#canvas > .wrapper');
  const palette = document.getElementById('palette_form');
  const object_state = palette.querySelectorAll(
    'input[type="text"], input[type="radio"]:checked'
  );

  // 도형 설정값을 JSON형태로 치환.
  const settings = Array.from(object_state).reduce(function (prev, crnt, idx) {
    if (idx === 1) {
      const _setting = {};
      _setting[prev.name] = prev.value;
      _setting[crnt.name] = crnt.value;
      return _setting;
    }
    prev[crnt.name] = crnt.value;

    return prev;
  });

  // 도형 생성
  const object = createObject(settings);

  // 도형을 도화지에 추가
  canvas.appendChild(object);

  // 도형이 텍스트인 경우, 바로 글을 작성할 수 있도록 포커싱.
  if (settings.shape === 'text') {
    object.focus();
  }
}

// 도형 삭제 이벤트 핸들러
function handleObjectRemove(event) {
  event.preventDefault();
  event.target.remove();
}

// 도형 선택 이벤트 핸들러
function handleObjectHold(event) {
  event.preventDefault();

  event.target.focus();

  const canvas = document.querySelector('#canvas > .wrapper');
  const objects = canvas.querySelectorAll('.object');
  let seledted_object = event.target;
  let classList = seledted_object.classList;

  if (!classList.contains('hold')) {
    // 마우스 커서의 위치 (왼쪽 상단 모서리 기준)
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // 선택한 도형의 위치 (왼쪽 상단 모서리 기준)
    const objectPos = seledted_object.getBoundingClientRect();
    const objectX = objectPos.x;
    const objectY = objectPos.y;

    // 도형과 마우스의 위치 차이
    const gapX = mouseX - objectX;
    const gapY = mouseY - objectY;

    // 도형과 마우스의 위치 차이를 속성에 저장
    seledted_object.setAttribute('gap-x', gapX);
    seledted_object.setAttribute('gap-y', gapY);

    // 선택한 도형을 맨 앞으로 보내기
    const priority = getMaxAttr(objects, 'priority', 0);
    seledted_object.setAttribute('priority', priority);
    seledted_object.style['z-index'] = priority;

    // 선택한 도형에 'hold' class를 추가
    classList.add('hold');
  }
}

// 도형 움직임 이벤트 핸들러
function handleObjectDrag(event) {
  event.preventDefault();

  const canvas = document.querySelector('#canvas > .wrapper');
  const object = canvas.querySelector('.object.hold');
  if (object) {
    // 마우스 커서의 위치. (왼쪽 상단 모서리 기준)
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // 도화지의 위치. (왼쪽 상단 모서리 기준)
    const canvasPos = canvas.getBoundingClientRect();
    const canvasX = canvasPos.x;
    const canvasY = canvasPos.y;

    // 도형과 마우스의 위치 차이
    const gapX = object.getAttribute('gap-x');
    const gapY = object.getAttribute('gap-y');

    // 도형이 이동할 위치
    const objectX = mouseX - gapX - canvasX;
    const objectY = mouseY - gapY - canvasY;

    object.style.left = objectX + 'px';
    object.style.top = objectY + 'px';
  }
}

// 도형 놓기 이벤트 핸들러
function handleObjectDrop(event) {
  event.preventDefault();

  const canvas = document.querySelector('#canvas > .wrapper');
  const object = canvas.querySelector('.object.hold');
  if (object) {
    // 속성 및 class를 삭제
    object.removeAttribute('gap-x');
    object.removeAttribute('gap-y');

    object.classList.remove('hold');
  }
}

// 색연필 그리기 이벤트 핸들러
const color = document.getElementById('color');
const lineWidth = document.querySelector('#line-width');
const palette = document.querySelector('#canvas > .wrapper');

const ctx = palette.getContext('2d'); //2d로 그릴 것을 지정. ctx는 palette에 그림 그릴 떄 쓰는 것.
palette.width = 800;
palette.height = 800;
ctx.lineWidth = lineWidth.value; // 기본 선 굵기 값 설정.
let isPainting = false; // isPainting을 true로 변경될 수 있도록 let으로 설정

function onMove(event) {
  if (isPainting) {
    ctx.lineTo(event.offsetX, event.offsetY); // 마우스의 현재 위치에 선을 그린다.
    ctx.stroke(); //그린 선을 나타낸다.
  }
  ctx.moveTo(event.offsetX, event.offsetY); // isPainting이 false면 마우스를 따라 이동만 한다.
}

function startPainting() {
  // 그림을 그리는 함수. isPainting이 true일 경우 -> onMove함수의 if문에 구현
  isPainting = true;
}

function quitPainting() {
  // 그림을 그리지 않는 함수.
  isPainting = false;
  ctx.beginPath(); // 마우스를 누르지 않았을 때 그려진 선의 path 분리. -> 새로 그려진 선과 같은 path값과 같은 path값을 갖지 않아야 선 굵기를 조절할 때 마다 각자 다른 굵기를 가질 수 있다.
}

function onlineChangeWidth() {
  // 변경된 선 굵기 값을 적용받게 하는 함수.
  ctx.lineWidth = event.target.value;
}

function oncolorChange(event) {
  ctx.strokeStyle = event.target.value; // 선 색상 변경
  ctx.fillStyle = event.target.value;
}

palette.addEventListener('mousemove', onMove);
palette.addEventListener('mousedown', startPainting);
palette.addEventListener('mouseup', quitPainting);
palette.addEventListener('mouseleave', quitPainting);
lineWidth.addEventListener('input', onlineChangeWidth);
color.addEventListener('input', oncolorChange);
