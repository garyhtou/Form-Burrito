# Form Burrito (WIP)

Seamless custom domains/urls for your Typeforms and Google Forms.

A React app that embeds your forms on your domain and uses Firebase for auth and database.

## Firebase Realtime Database

**Rules**

```json
{
	"rules": {
		".read": false,
		".write": false,
		"urls": {
			".read": true,
			".write": "auth != null && root.child('users/' + auth.uid).exists() && root.child('users/' + auth.uid).val() === true",
			".validate": "newData.hasChildren(['short', 'full', 'type'])"
		},
		"users": {
			".read": "auth != null && root.child('users/' + auth.uid).exists() && root.child('users/' + auth.uid).val() === true",
			".write": "auth != null && root.child('users/' + auth.uid).exists() && root.child('users/' + auth.uid).val() === true",
			".validate": "newData.val() === true || newData.val() === false"
		}
	}
}
```
