# Bookkeeping_Nodejs
Simple bookkeeping web application built with Nodejs

## Why Build This
First, an app/service that meet my bookkeeping need is hard to find. I have used several bookkeeping apps before, but after spending a few months with each of them, it always turned out that they are either equipped with too much redundant features for me (huge report on mobile screen that makes it hard to read the numbers), or having fundamental principle which does not suit me, e.g. same category cannot be shared by different account.

Second, this little piece of work might help other people. Since somebody else have the same issue stated above, well at least my wife does, I figure it should feel rewarding to provide a solution and see it do some good.

Third, there is so much fun (sometimes frustration :D) in building something that runs. Before I started programming, I often wondered what if there is something that does blah blah blah. Now it's time to verify that "what if" with some plan and pieces of code.

## Current Status (v0.7.0)
The goal of v1.0.0 is about keeping records of money flow, querying them, as well as cheking distribution summary. Except user creation, the major use cases are done. The gap from here to v1.0.0 includes:
1. Create user
2. Delete record
3. Promotion/Manual page

The analysis and design of this project is documented in SAD.md under project root folder. It is written with an awesome Atom package called [markdown-preview-enhanced](https://atom.io/packages/markdown-preview-enhanced). The HTML version is enclosed as well.

### A Glimpse of What's Going On

![Distribution Summary](https://i.imgur.com/Gw5el8C.png?1)

![Flow Records](https://i.imgur.com/YIlCL10.png?1)

![Keep Expense](https://i.imgur.com/W85OdCg.png?1)

![Transfer](https://i.imgur.com/XoBots2.png?1)

## Future Roadmap
- v2.0.0
 1. Collaborate with other user
 2. UI for desktop browser (current UI only considers disply of mobile browser)
 3. i18n for UI
- v3.0.0
 1. Work offline with most features (make it a Progressive Web App)
 2. More analysis insight from flow records
- v4.0.0
 1. Automated/Suggested tags on flow record (Topic modeling with unknown set of topics)
