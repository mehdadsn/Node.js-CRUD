var table = document.querySelector('.table');
var editId = 0;
loadTable();

function loadTable() {
    let obj;
    fetch('http://localhost:8080/users')
        .then(res => res.json())
        .then(data => obj = data)
        .then(() => {
            var htm = '<table><tr>' +
                '<th>Name</th>' +
                '<th>EmpCode</th>' +
                '<th>Salary</th>' +
                '</tr>';

            obj.forEach(element => {
                htm += `<tr>
                <td>${element.Name}</td>
                <td>${element.EmpCode}</td>
                <td>${element.Salary}</td>
                <td><button class="delete" onclick="dlt(${element.EmpID})">delete</button></td>
                <td><button class="edit" onclick="edit(${element.EmpID},'${element.Name}','${element.EmpCode}',${element.Salary})">edit</button></td>
                </tr>`
            });
            table.innerHTML = htm;
        })
}

var submit = document.getElementById('submit');

submit.addEventListener('click', () => {
    var name = document.getElementById('name').value;
    var empcode = document.getElementById('employeeCode').value;
    var salary = document.getElementById('salary').value;
    var employee = {
        Name: name,
        EmpCode: empcode,
        Salary: salary
    }
    if (editId == 0) {
        fetch('http://localhost:8080/create', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employee)
        })
            .then(() => loadTable())
            .catch(error => console.log(error));
    } else {
        fetch(`http://localhost:8080/edit?${editId}`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employee)
        })
            .then(() => loadTable())
            .catch(error => console.log(error));
        editId = 0;
        document.getElementById('name').value = '';
        document.getElementById('employeeCode').value = '';
        document.getElementById('salary').value = '';
    }
    loadTable();
})

function dlt(id) {
    fetch(`http://localhost:8080/delete?${id}`)
        .then(() => loadTable())
        .catch(error => console.log(error));
}
function edit(id, name, empCode, salary) {

    document.getElementById('name').value = name;
    document.getElementById('employeeCode').value = empCode;
    document.getElementById('salary').value = salary;

    editId = id;

}