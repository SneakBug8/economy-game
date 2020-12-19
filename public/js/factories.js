function workersButton(id) {
        $("#workerspanel-"+id).toggleClass("d-none");
}
function salaryButton(id) {
    $("#salarypanel-"+id).toggleClass("d-none");
}

function deleteconfirm(url) {
    var r = confirm("Are you sure you want to delete it?");
if (r == false) {
  return;
}
window.location = url;
}