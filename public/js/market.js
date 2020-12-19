function closeOverlay() {
    $("#amountOverlay").addClass("d-none");
}

function openAmount() {
    $("#amountOverlay").removeClass("d-none");
}

function onBuyButton(type, offerid) {
    $("#overlayForm").attr("action", `/market/${goodid}/redeem${type}/${offerid}`);
    $(".overlay-big-btn").attr("href", `/market/${goodid}/redeem${type}/${offerid}`);
    openAmount();
}