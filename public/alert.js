// Alert system

function notificationAlert(titleText, text) {
    // Append blanker to body children
    // Append alert to blanker
    // On close of alert => delete blanket wrapper
    let prototype = document.createElement('div');
    prototype.classList.add('blanker');

    let prototypeAlert = document.createElement('div');
    prototypeAlert.classList.add('alert');


    let title = document.createElement('h3');
    title.innerHTML = titleText;
    let p = document.createElement('p');
    p.innerHTML = text;
    let close = document.createElement('button');
    close.innerHTML = 'Close';
    close.onclick = dispose;
    prototypeAlert.appendChild(title);
    prototypeAlert.appendChild(p);
    prototypeAlert.appendChild(close);

    
    
    prototype.appendChild(prototypeAlert);

    function dispose(ele) {
        document.body.removeChild(prototype);
    }
    document.body.appendChild(prototype);
}