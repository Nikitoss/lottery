
type TAccountProps = {
    account: string;
}

export function Account({account}: TAccountProps) {
    if (!account) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl p-8 shadow-md ">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                {account}
            </div>
        </div>
    );
}