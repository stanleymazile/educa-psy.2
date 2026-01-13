## **script.js**

```javascript
const btnMenu = document.getElementById('btnMenu');
const menu = document.getElementById('liens-deroulants');

btnMenu.onclick = function(e) {
    menu.classList.toggle('voir');
    e.stopPropagation();
}

window.onclick = function() {
    menu.classList.remove('voir');
}

document.getElementById('select-langue').addEventListener('change', function() {
    var lang = this.value;
    console.log('Langue sélectionnée:', lang);
});
```
