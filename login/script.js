function handleDialogVisibility() {
  const dialog = document.getElementById("sign-in-dialog");
  console.log(dialog.style.display);
  if (dialog.style.display === "none" || dialog.style.display === "") {
    dialog.style.display = "block";
  } else {
    dialog.style.display = "none";
  }
}

function showPassword() {
  const passwordField = document.getElementById("password-field");
  const eyeIcon = document.getElementById("eye-icon");
  if (passwordField.type === "password") {
    passwordField.type = "text";
    eyeIcon.src = "../assets/icons/eye-icon-closed.svg"
  } else {
    passwordField.type = "password";
    eyeIcon.src = "../assets/icons/eye-icon.svg"
  }
}
