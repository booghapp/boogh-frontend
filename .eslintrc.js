module.exports = {
    "env": {
        "browser": true
    },
    "extends": [
        "airbnb",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/typescript"
    ],
    "plugins": [
        "import"
    ],
    "rules": {
        "arrow-parens": [
            "warn",
            "always"
        ],
        "class-methods-use-this": "off",
        "import/prefer-default-export": "off",
        "import/no-default-export": "error",
        "jsx-quotes": [
            "error",
            "prefer-single"
        ],
        "max-len": [
            "warn",
            {
                "code": 100,
                "ignoreStrings": true,
                "ignoreTemplateLiterals": true
            }
        ],
        "no-console": "off",
        "object-shorthand": ["error", "never"],
        "@typescript-eslint/array-type": [
            "error",
            "generic"
        ],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "react/destructuring-assignment": "off",
        "react/jsx-filename-extension": [
            "error",
            {
                "extensions": [".tsx"]
            }
        ],
        "react/jsx-indent": [
            "error",
            4,
            {
                "checkAttributes": true
            }
        ],
        "react/jsx-indent-props": [
            "error",
            4
        ],
        "react/jsx-max-props-per-line": [
            "warn",
            {
                "maximum": 1,
                "when": "always",
            }
        ],
        "react/jsx-sort-props": "warn"
    },
    "settings": {
        "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"]
        }
    }
};
