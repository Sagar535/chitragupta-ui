## Chitragupta

#### Getting Started

1. Create `.env.local` file. Add contents

    ```bash
    NEXT_PUBLIC_REMOTE_URL='http://localhost:4000'
    NEXT_PUBLIC_CAPTCHA_SITE_KEY='6Ldn0s4eAAAAAD31vMnGJaEZ4pne7uVvh4jbzSPk'
    ```

2. `yarn` to install all the required packages.

3. `rails s -p 4000` for backend development server.

4. Run the frontend development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
