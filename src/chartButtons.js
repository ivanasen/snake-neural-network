const showInfoBtn = document.getElementById('show-info-btn')
const hideInfoBtn = document.getElementById('hide-info-btn')
const infoHolder = document.getElementById('info-holder')

showInfoBtn.addEventListener('click', () => {
  showInfoBtn.classList.add('invisible')
  infoHolder.classList.remove('invisible')
})

hideInfoBtn.addEventListener('click', () => {
  showInfoBtn.classList.remove('invisible')
  infoHolder.classList.add('invisible')
})