const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");
const crypto = require("crypto");

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  ignoreExpiration: false,
  passReqToCallback: true,
};

passport.use(
  new JwtStrategy(jwtOptions, async (req, payload, done) => {
    try {
      const user = await User.findById(payload.userId);

      if (!user) {
        return done(null, false, { message: "User not found" });
      }

      if (!user.isActive) {
        return done(null, false, { message: "User account is inactive" });
      }

      // Thêm thông tin người dùng vào request
      req.user = user;

      return done(null, user);
    } catch (error) {
      console.error("JWT Authentication Error:", error);
      return done(error, false);
    }
  })
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:", profile);

        // Kiểm tra xem người dùng đã tồn tại chưa
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Nếu người dùng tồn tại, cập nhật thông tin Google
          user.googleId = profile.id;
          user.name = profile.displayName;
          await user.save();
          return done(null, user);
        }

        // Tạo mật khẩu ngẫu nhiên an toàn
        const randomPassword = crypto.randomBytes(16).toString("hex");

        // Nếu chưa tồn tại, tạo người dùng mới
        const newUser = new User({
          email: profile.emails[0].value,
          name: profile.displayName,
          googleId: profile.id,
          password: randomPassword,
          isVerified: true,
          role: "user",
          phone: "", // Để trống, có thể cập nhật sau
          isActive: true,
        });

        await newUser.save();
        console.log("Created new user:", newUser);

        return done(null, newUser);
      } catch (error) {
        console.error("Google auth error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
