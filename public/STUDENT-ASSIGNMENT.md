# Campus Cart QA Assignment

## Overview

Campus Cart is a demo shop for campus essentials. It has a React and Vite front end, an Express backend, a local catalog, user accounts, a cart and wishlist, and a working checkout flow. The app was built with quality in mind, but it is not bug free.

Your task is to test the application like a software tester: explore it, plan your tests, execute them, and report what you find.

## What you will do

1. Run the app locally. The README in the project folder explains how.
2. Explore every page so you understand how the app is supposed to work.
3. Write and document test cases for the features you examine.
4. Execute your test cases and record the results.
5. Write formal bug reports for the defects you find.

## Expected requirements

The app should behave as follows. These are the expected requirements you test against. The full text of these requirements is the specification for your work.

### Catalog and shop

- The Shop page lists all products, each with its name, price, and category.
- Product categories are Stationery, Accessories, and Home & Desk.
- The Shop has a search box and a price sort control.
- Each product has a Product page with its details and an Add to Cart action.

### Cart

- Items can be added to the cart and removed from the cart.
- Each cart line has a quantity input. Quantities below 1 or above 5 are not allowed.
- The cart shows a merchandise subtotal.
- The cart badge in the header reflects the number of items in the cart.

### Discounts and shipping

- A promo code box accepts codes. CAMPUS10 gives a 10 percent discount on the merchandise subtotal, with a minimum merchandise subtotal of 100 before the discount is applied. Invalid codes are rejected.
- Shipping costs 50 for any order below 500. Orders at or above 500 get free shipping. The shipping threshold is checked on the merchandise subtotal before any discount.
- There is no additional tax. The order total is the discounted merchandise subtotal plus shipping.

### Checkout

- Checkout collects a contact name, email, phone, address, city, and agreement to the terms.
- All fields are required. Values are trimmed before validation.
- The email must look like a normal address: a nonempty local part, then @, then a domain containing a dot, with no spaces.
- The phone must be exactly 11 digits and must begin with 09.
- Checkout cannot be submitted unless the terms checkbox is ticked.
- After a successful order the cart is cleared and an order confirmation is shown.

### Accounts and orders

- You can register an account and log in. Registration and login require a valid email format and a password of at least 8 characters.
- The Account page shows the profile. The Orders page shows your order history.
- The Contact page submits messages. The Help and Policies pages are informational.
- Guest checkout is supported: you can place a demo order without logging in.

### Wishlist

- Products can be added to and removed from the wishlist. The wishlist page lists the saved products.

## Deliverables

Submit two files.

1. **Test cases.** A table or spreadsheet with at least 12 documented test cases. Each test case includes an ID, a title, the steps to reproduce, the expected result, and the actual result you observed. Target: 12 or more test cases.
2. **Bug reports.** Formal bug reports following the bug report template provided in the project folder. Target: 5 or more bug reports. Each report includes an ID, a title, severity, the steps to reproduce, the expected result, and the actual result.

Quality matters more than quantity. A precise, reproducible report of one real defect is worth more than several vague ones.

## Grading rubric (100 points)

| Component | Points |
| --- | --- |
| Test case coverage: the main features (shop, cart, promo codes, checkout, accounts) each have documented test cases | 30 |
| Test case quality: steps are clear and numbered, expected results are specific and checkable | 20 |
| Bug report quality: reports follow the template, include clear reproduction steps, expected versus actual, and a reasonable severity | 25 |
| Defect discovery: meaningful defects are found and correctly characterized (not duplicates, not cosmetic misunderstandings of the specification) | 15 |
| Communication: organized submission, consistent IDs, readable writing | 10 |
| **Total** | **100** |

## Tips

- Explore first, then write test cases around what you see. Test both the happy path and edge cases: boundaries of the quantity input, boundary values for the shipping threshold, invalid promo codes, malformed emails and phone numbers, and the terms checkbox.
- Check that numbers shown in one place agree with numbers shown in another, for example the cart badge versus the cart lines, or the subtotal versus what checkout charges.
- Record actual results exactly as you observed them, including any message the app shows you.
- The bug report template in the project folder shows the required format for your reports.

## Notes

- All data in the app is fictional. Do not enter real personal information.
- Use the demo account shown on the login page, or register your own test account.
- You do not need any account or API setup to run the app.
