// pages/index.js
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Home = () => {
  return (
    <div className=" fixed left-0 top-0 h-full w-full py-10 bg-black flex justify-center items-center overflow-auto">
      <Tabs defaultValue="login" className=' w-fit h-fit bg-zinc-900 flex justify-center items-center flex-col p-20 rounded-3xl'>
        <h1 className=' text-white text-xl m-10'>Welcome!</h1>
        <TabsList className=' mb-5'>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Signup</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="signup">
          <SignupForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;