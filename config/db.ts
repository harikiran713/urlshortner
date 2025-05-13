import mongoose from "mongoose";
async function connect()
{
     return await mongoose.connect(process.env.MONGODB_URI as string)
}
export default connect;