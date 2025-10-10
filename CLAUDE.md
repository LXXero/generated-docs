- i have a either a  .tsx or .html file i want to publish to my server and generate appropriate metadata for. In the case of the .tsx, I'd like to build a consumable HTML file, or in the case of html, simply publish it.

I need it to be placed into a folder in the webroot, like "/public_html/the-title-of-this-thing" with a README.txt generated that is formatted as such, with a "pretty title" as the very first line:
The Title Of This Thing
A description of that thing that the title above is talking about.

i'd like to be able to drop new files in here and have files published like this easily.

I also want you to commit + deploy after every change - setup a github repo named after this folder, with this in mind for these projects, and i also want you to use my deploy.sh as a reference for connection strings as well as resetting cache 
/Users/xero/dos-web-menu

this should clear cloudflare cache after deploy, too
- also want to make note that the deploy.sh uses SCP/SFTP and the server has no ssh access and is chrooted - please use exactly the type of commands in here to deploy and clear the cache - this is under the same domain and general webroot as that - so all should work