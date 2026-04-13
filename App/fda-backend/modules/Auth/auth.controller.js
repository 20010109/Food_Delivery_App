import { signupUser, loginUser } from "./auth.service.js";

export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const data = await signupUser(email, password);
    const user = data.user || data.session?.user;
    if(!user){
      return res.status(400).json({ error: 'User creation failed' });
    }

    return res.json({
      message: 'User signed up successfully',
      user_id: user.id,
      access_token: data.session?.access_token || null,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });   
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);

    return res.json({
      message: 'User logged in successfully',
      access_token: data.session.access_token,
      user: data.user?.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}