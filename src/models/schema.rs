table! {
    /// Representation of the `flappy_leaderboard` table.
    ///
    /// (Automatically generated by Diesel.)
    flappy_leaderboard (id) {
        /// The `id` column of the `flappy_leaderboard` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        id -> Integer,
        /// The `name` column of the `flappy_leaderboard` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        name -> Text,
        /// The `score` column of the `flappy_leaderboard` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        score -> Integer,
        /// The `timestamp` column of the `flappy_leaderboard` table.
        ///
        /// Its SQL type is `Timestamp`.
        ///
        /// (Automatically generated by Diesel.)
        timestamp -> Timestamp,
    }
}

table! {
    /// Representation of the `git_lfs_download_token` table.
    ///
    /// (Automatically generated by Diesel.)
    git_lfs_download_token (token) {
        /// The `token` column of the `git_lfs_download_token` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        token -> Text,
        /// The `object` column of the `git_lfs_download_token` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        object -> Integer,
        /// The `expires` column of the `git_lfs_download_token` table.
        ///
        /// Its SQL type is `Timestamp`.
        ///
        /// (Automatically generated by Diesel.)
        expires -> Timestamp,
    }
}

table! {
    /// Representation of the `git_lfs_object` table.
    ///
    /// (Automatically generated by Diesel.)
    git_lfs_object (id) {
        /// The `id` column of the `git_lfs_object` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        id -> Integer,
        /// The `oid` column of the `git_lfs_object` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        oid -> Text,
        /// The `size` column of the `git_lfs_object` table.
        ///
        /// Its SQL type is `BigInt`.
        ///
        /// (Automatically generated by Diesel.)
        size -> BigInt,
        /// The `repository` column of the `git_lfs_object` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        repository -> Integer,
    }
}

table! {
    /// Representation of the `git_lfs_repository` table.
    ///
    /// (Automatically generated by Diesel.)
    git_lfs_repository (id) {
        /// The `id` column of the `git_lfs_repository` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        id -> Integer,
        /// The `owner` column of the `git_lfs_repository` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        owner -> Integer,
        /// The `name` column of the `git_lfs_repository` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        name -> Text,
    }
}

table! {
    /// Representation of the `git_lfs_upload_token` table.
    ///
    /// (Automatically generated by Diesel.)
    git_lfs_upload_token (token) {
        /// The `token` column of the `git_lfs_upload_token` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        token -> Text,
        /// The `object` column of the `git_lfs_upload_token` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        object -> Integer,
        /// The `expires` column of the `git_lfs_upload_token` table.
        ///
        /// Its SQL type is `Timestamp`.
        ///
        /// (Automatically generated by Diesel.)
        expires -> Timestamp,
    }
}

table! {
    /// Representation of the `linc_interest` table.
    ///
    /// (Automatically generated by Diesel.)
    linc_interest (id) {
        /// The `id` column of the `linc_interest` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        id -> Integer,
        /// The `name` column of the `linc_interest` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        name -> Text,
        /// The `desc` column of the `linc_interest` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        desc -> Text,
    }
}

table! {
    /// Representation of the `linc_lastedited` table.
    ///
    /// (Automatically generated by Diesel.)
    linc_lastedited (id) {
        /// The `id` column of the `linc_lastedited` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        id -> Integer,
        /// The `timestamp` column of the `linc_lastedited` table.
        ///
        /// Its SQL type is `Timestamp`.
        ///
        /// (Automatically generated by Diesel.)
        timestamp -> Timestamp,
    }
}

table! {
    /// Representation of the `linc_person` table.
    ///
    /// (Automatically generated by Diesel.)
    linc_person (id) {
        /// The `id` column of the `linc_person` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        id -> Integer,
        /// The `name` column of the `linc_person` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        name -> Text,
        /// The `interest1_id` column of the `linc_person` table.
        ///
        /// Its SQL type is `Nullable<Integer>`.
        ///
        /// (Automatically generated by Diesel.)
        interest1_id -> Nullable<Integer>,
        /// The `interest2_id` column of the `linc_person` table.
        ///
        /// Its SQL type is `Nullable<Integer>`.
        ///
        /// (Automatically generated by Diesel.)
        interest2_id -> Nullable<Integer>,
        /// The `interest3_id` column of the `linc_person` table.
        ///
        /// Its SQL type is `Nullable<Integer>`.
        ///
        /// (Automatically generated by Diesel.)
        interest3_id -> Nullable<Integer>,
        /// The `twitter_pic_url` column of the `linc_person` table.
        ///
        /// Its SQL type is `Nullable<Text>`.
        ///
        /// (Automatically generated by Diesel.)
        twitter_pic_url -> Nullable<Text>,
        /// The `twitter` column of the `linc_person` table.
        ///
        /// Its SQL type is `Nullable<Text>`.
        ///
        /// (Automatically generated by Diesel.)
        twitter -> Nullable<Text>,
    }
}

table! {
    /// Representation of the `session_token` table.
    ///
    /// (Automatically generated by Diesel.)
    session_token (token) {
        /// The `token` column of the `session_token` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        token -> Text,
        /// The `user` column of the `session_token` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        user -> Integer,
        /// The `expires` column of the `session_token` table.
        ///
        /// Its SQL type is `Timestamp`.
        ///
        /// (Automatically generated by Diesel.)
        expires -> Timestamp,
    }
}

table! {
    /// Representation of the `user` table.
    ///
    /// (Automatically generated by Diesel.)
    user (id) {
        /// The `id` column of the `user` table.
        ///
        /// Its SQL type is `Integer`.
        ///
        /// (Automatically generated by Diesel.)
        id -> Integer,
        /// The `name` column of the `user` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        name -> Text,
        /// The `email` column of the `user` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        email -> Text,
        /// The `password` column of the `user` table.
        ///
        /// Its SQL type is `Text`.
        ///
        /// (Automatically generated by Diesel.)
        password -> Text,
        /// The `created` column of the `user` table.
        ///
        /// Its SQL type is `Timestamp`.
        ///
        /// (Automatically generated by Diesel.)
        created -> Timestamp,
        /// The `admin` column of the `user` table.
        ///
        /// Its SQL type is `Bool`.
        ///
        /// (Automatically generated by Diesel.)
        admin -> Bool,
    }
}

joinable!(git_lfs_download_token -> git_lfs_object (object));
joinable!(git_lfs_object -> git_lfs_repository (repository));
joinable!(git_lfs_repository -> user (owner));
joinable!(git_lfs_upload_token -> git_lfs_object (object));
joinable!(session_token -> user (user));

allow_tables_to_appear_in_same_query!(
    flappy_leaderboard,
    git_lfs_download_token,
    git_lfs_object,
    git_lfs_repository,
    git_lfs_upload_token,
    linc_interest,
    linc_lastedited,
    linc_person,
    session_token,
    user,
);
