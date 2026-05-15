let html = ''
function renderWindow(){
  html = `
    <div id="window_down">
      <div class="pop-opacity"></div>
        <div class="float-window">
        <div class="choose-lang-title">languages:</div>
          <div class="choose-lang" onclick="
            removePopWindow();
          ">עברית</div>
          <div class="choose-lang" onclick="
            window.location.href='https://blindtyping.com/lessons';
          ">english</div>
        </div>
        <div class = "remove-pop">
          <button class="remove-pop-button" onclick="
            removePopWindow();
        ">X</button>
      </div>
    </div>
  `;
  document.querySelector('.js-lang-pop')
    .innerHTML = html;
}

function removePopWindow(){
  let window_down =
      document.getElementById("window_down");
  window_down.parentNode.removeChild(window_down);

}