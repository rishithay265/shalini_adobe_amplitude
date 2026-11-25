import Workspace from "../workspace"; export default async function Page({ params }: { params: Promise<{ view: string }> }) { return <Workspace view={(await params).view} />; }
