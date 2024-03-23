export function handleClick(event) {
  if (event.target.classList.contains("jamonbread")) {
    console.log("Button with class 'jamonbread' clicked!");
  }
}

document.body.addEventListener("click", handleClick);
