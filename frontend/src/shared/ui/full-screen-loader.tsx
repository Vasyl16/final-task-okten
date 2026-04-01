export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="space-y-2 text-center">
        <p className="text-lg font-medium">Перевіряємо сесію</p>
        <p className="text-sm text-muted-foreground">Зачекайте, будь ласка...</p>
      </div>
    </div>
  )
}
