Object.defineProperties(String.prototype, {
    replaceLast: {
        value: function (symbol) {
            const lastIndex = this.lastIndexOf(symbol);

            if (lastIndex === -1) {
                return this;
            }

            return this.slice(0, lastIndex) + this.slice(lastIndex + 1);
        },
        writable: true,
        configurable: true,
    },
    removeControlCharacters: {
        value: function () {
            return this.replace(/[\u2066\u2067\u2068\u2069]/g, '');
        },
        writable: true,
        configurable: true,
    }
});

export default {};