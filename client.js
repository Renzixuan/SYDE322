function authenticate() {
    axios.defaults.withCredentials = true;

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    axios.post('http://localhost:8080/authenticate', {
        'username': username,
        'password': password
    })
    .then(function (res) {
        console.log(res);
        window.sessionStorage.accessToken = res.data.token;
        window.location.assign('http://localhost:3000/home');
    })
    .catch (function (err) {
        console.error(err);
        document.getElementById('errorMessage').style.visibility = 'visible';
    });
}

function postResult() {
    axios.defaults.withCredentials = true;

    var expression = document.getElementById('expression').value;
    const token = window.sessionStorage.getItem('accessToken');

    axios.post('http://localhost:8080/result', {'expression': expression}, {headers: {'Authorization': "Bearer " + token}})
    .then(function (res) {
        console.log(res);
        document.getElementById('simplifiedExpression').value = res.data;
    })
    .catch (function (err) {
        console.error(err);

    	if (err.response.status === 401) {
        	window.location.assign('http://localhost:3000/login');
        }
    });
}

function postPostfix() {
    axios.defaults.withCredentials = true;

    var expression = document.getElementById('expression').value;
	const token = window.sessionStorage.getItem('accessToken');

    axios.post('http://localhost:8080/postfix', {'expression': expression}, {headers: {'Authorization': "Bearer " + token}})
    .then(function (res) {
        console.log(res);
        document.getElementById('postfix').value = res.data;
    })
    .catch (function (err) {
        console.error(err);

    	if (err.response.status === 401) {
        	window.location.assign('http://localhost:3000/login');
        } else if (err.response.status === 403) {
            document.getElementById('premiumMessage').style.visibility = 'visible';
        }
    });
}