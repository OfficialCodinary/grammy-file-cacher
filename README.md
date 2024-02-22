# grammy-file-cacher

A middleware for caching media files in a Telegram bot built with the `grammy` library.

## Installation

You can install `grammy-file-cacher` via npm:

```bash
npm install grammy-file-cacher
```

## Usage

First, import the `CacheMedias` function from `grammy-file-cacher`:

```javascript
import { CacheMedias } from 'grammy-file-cacher'
```

Next, use it as middleware in your bot's configuration:

```javascript
import { Bot } from 'grammy';

const bot = new Bot('YOUR_TOKEN_HERE');

// Use CacheMedias middleware
bot.api.config.use(CacheMedias());
```

Now, whenever your bot sends media files (such as photos, audio, video, etc.), `grammy-file-cacher` will cache their IDs, reducing the need to fetch them repeatedly from the Telegram API.

## Example

Here's an example of how you can use `grammy-file-cacher`:

```javascript
import { Bot, InputFile } from 'grammy';
import { CacheMedias } from 'grammy-file-cacher'

const bot = new Bot('YOUR_TOKEN_HERE');

// Use CacheMedias middleware
bot.api.config.use(CacheMedias());

bot.command('sendphoto', async (ctx) => {
    // Send 5 photos
    await ctx.replyWithPhoto(new InputFile('./photo.jpg'));
    await ctx.replyWithPhoto(new InputFile('./photo.jpg'));
    await ctx.replyWithPhoto(new InputFile('./photo.jpg'));
    await ctx.replyWithPhoto(new InputFile('./photo.jpg'));
    await ctx.replyWithPhoto(new InputFile('./photo.jpg'));
});

bot.start();
```

## Features

- No hard setup required
- Works seemlessly, Install and get going
- Written in 100% TypeScript
- Smart concurrency
  - ie: It can detect and hold up the rest of the same request for maximum
    efficiency!

## Contributing

Contributions are welcome! Please check the [contribution guidelines](CONTRIBUTING.md) before making any contributions.

## License

`grammy-file-cacher` is licensed under the [MIT License](LICENSE).
