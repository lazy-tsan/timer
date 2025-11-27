(() => {
  const display = document.getElementById('display');
  const btnStart = document.getElementById('start');
  const btnReset = document.getElementById('reset');

  let running = false;
  let startPerf = 0; // performance.now when started
  let elapsedBefore = 0; // ms accumulated while paused
  let rafId = null;

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
    btnStart.textContent = 'Countdown';
    btnReset.disabled = false;
    rafId = requestAnimationFrame(update);
  }

  function stop(){
    if(!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    const now = performance.now();
    elapsedBefore += now - startPerf;
    btnStart.textContent = 'Start';
    update();
  }

  function reset(){
    // cancel any running countdown or stopwatch
    cancelCountdown();
    running = false;
    cancelAnimationFrame(rafId);
    elapsedBefore = 0;
    startPerf = 0;
    display.textContent = '00:00.000';
    btnReset.disabled = true;
    btnStart.textContent = 'Start';
  }


  btnStart.addEventListener('click', ()=>{
    if(running) stop(); else start();
    update();
  });
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
    btnStart.textContent = 'Cancel';
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
    btnStart.textContent = 'Start';
    btnReset.disabled = elapsedBefore > 0 ? false : true;
  }

  // initialize display
  display.textContent = '00:00.000';
})();
