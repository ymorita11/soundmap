import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-dark-gray">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-dark-navy border border-border shadow-xl',
            headerTitle: 'text-off-white',
            headerSubtitle: 'text-gray',
            socialButtonsBlockButton: 'border-border text-off-white hover:bg-deep-black',
            formFieldLabel: 'text-gray',
            formFieldInput: 'bg-deep-black border-border text-off-white',
            footerActionLink: 'text-soft-blue hover:text-soft-blue/80',
          },
        }}
        routing="path"
        path="/sign-up"
      />
    </div>
  )
}
