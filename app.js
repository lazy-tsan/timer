(() => {
  const display = document.getElementById('display');
  const btnStartStop = document.getElementById('startStop');
  const btnLap = document.getElementById('lap');
  const btnReset = document.getElementById('reset');
  const lapsList = document.getElementById('laps');

  let running = false;
  let startPerf = 0; // performance.now when started
  let elapsedBefore = 0; // ms accumulated while paused
  let rafId = null;
  const laps = [];

  // countdown state
  let countdownActive = false;
  let countdownInterval = null;
  let countdownRemaining = 0;

  function formatTime(ms){
    const totalMs = Math.floor(ms);
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const milli = totalMs % 1000;
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(milli).padStart(3,'0')}`;
  }

  function update(){
    const now = performance.now();
    const elapsed = elapsedBefore + (running ? now - startPerf : 0);
    display.textContent = formatTime(elapsed);
    if(running) rafId = requestAnimationFrame(update);
  }

  function start(){
    if(running) return;
    running = true;
    startPerf = performance.now();
    btnStartStop.textContent = 'Stop';
    btnLap.disabled = false;
    btnReset.disabled = false;
    rafId = requestAnimationFrame(update);
  }

  function stop(){
    if(!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    const now = performance.now();
    elapsedBefore += now - startPerf;
    btnStartStop.textContent = 'Start';
  }

  function reset(){
    // cancel any running countdown or stopwatch
    cancelCountdown();
    running = false;
    cancelAnimationFrame(rafId);
    elapsedBefore = 0;
    startPerf = 0;
    laps.length = 0;
    renderLaps();
    display.textContent = '00:00.000';
    btnLap.disabled = true;
    btnReset.disabled = true;
    btnStartStop.textContent = 'Start';
  }

  function lap(){
    const now = performance.now();
    const elapsed = elapsedBefore + (running ? now - startPerf : 0);
    laps.unshift(elapsed); // newest first
    renderLaps();
  }

  function renderLaps(){
    lapsList.innerHTML = '';
    laps.forEach((t, i) =>{
      const li = document.createElement('li');
      li.textContent = `${laps.length - i}. ${formatTime(t)}`;
      lapsList.appendChild(li);
    });
  }

  btnStartStop.addEventListener('click', ()=>{
    if(running) stop(); else start();
    update();
  });
  btnLap.addEventListener('click', ()=>{ if(!btnLap.disabled) lap(); });
  btnReset.addEventListener('click', ()=>{ reset(); });

  // keyboard shortcuts
  window.addEventListener('keydown', (e)=>{
    if(e.code === 'Space'){
      e.preventDefault();
      // if countdown active, cancel; else toggle
      if(countdownActive){ cancelCountdown(); return; }
      if(running) stop(); else beginStartCountdown(3);
      update();
    }
    if(e.key === 'l' || e.key === 'L'){
      if(!btnLap.disabled) lap();
    }
    if(e.key === 'r' || e.key === 'R'){
      reset();
    }
  });

  function beginStartCountdown(seconds = 3){
    if(running || countdownActive) return;
    countdownActive = true;
    countdownRemaining = seconds;
    // visual
    display.classList.add('countdown');
    display.textContent = String(countdownRemaining);
    btnStartStop.textContent = 'Cancel';
    btnLap.disabled = true;
    btnReset.disabled = true;

    countdownInterval = setInterval(()=>{
      countdownRemaining -= 1;
      if(countdownRemaining > 0){
        display.textContent = String(countdownRemaining);
      } else {
        // done
        cancelCountdown(false);
        display.classList.remove('countdown');
        display.textContent = '00:00.000';
        // actually start the stopwatch
        start();
      }
    }, 1000);
  }

  function cancelCountdown(clearDisplay = true){
    if(!countdownActive) return;
    clearInterval(countdownInterval);
    countdownInterval = null;
    countdownActive = false;
    if(clearDisplay){
      display.classList.remove('countdown');
      // restore previous elapsed or zero
      display.textContent = elapsedBefore > 0 ? formatTime(elapsedBefore) : '00:00.000';
    }
    // restore button label and states
    btnStartStop.textContent = 'Start';
    btnLap.disabled = true;
    btnReset.disabled = elapsedBefore > 0 ? false : true;
  }

  // initialize display
  display.textContent = '00:00.000';
})();
