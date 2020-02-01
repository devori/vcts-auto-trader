function truncRemainder(number, divisor) {
    if (divisor <= 1) {
        let mul = 1;
        while (divisor < 1) {
            divisor *= 10;
            mul *= 10;
        }
        return Math.trunc(number * mul) / mul;
    } else if (divisor > 1) {
        return number - number % divisor;
    }
}

export default {
    truncRemainder
}