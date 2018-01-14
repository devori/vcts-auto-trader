function truncRemainder(number, divisor) {
    let mul = 1;
    while (divisor < 1) {
        divisor *= 10;
        mul *= 10;
    }
    return Math.trunc(number * mul) / mul;
}

export default {
    truncRemainder
}