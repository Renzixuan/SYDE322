function postResult() {
    axios.defaults.withCredentials = true;

    var expression = document.getElementById('expression').value;

    axios.post('http://localhost:8080/result', {'expression': expression})
    .then(function (res) {
        console.log(res);
        document.getElementById('simplifiedExpression').value = res.data;
    })
    .catch (function (err) {
        console.error(err);
    });
}

function postPostfix() {
    axios.defaults.withCredentials = true;

    var expression = document.getElementById('expression').value;

    axios.post('http://localhost:8080/postfix', {'expression': expression})
    .then(function (res) {
        console.log(res);
        document.getElementById('postfix').value = res.data;
    })
    .catch (function (err) {
        console.error(err);
    });
}

function getHistory() {
    axios.defaults.withCredentials = true;

    var expression = document.getElementById('expression').value;

    axios.get('http://localhost:8080/history')
    .then(function (res) {
        window.open('http://localhost:8080/history');
        console.log(res);
    })
    .catch (function (err) {
        console.error(err);
    });
}