import { LockData, User } from 'common/interfaces';

interface Room {
    users: User[];
    lockedItems: { [key: string]: string };
}

class RoomManager {
    private activeRooms: { [key: string]: Room };

    constructor() {
        this.activeRooms = {};
    }

    getActiveRoomIds(): string[] {
        return Object.keys(this.activeRooms);
    }

    getRoomUsers(roomId: string): User[] {
        return this.activeRooms[roomId].users || [];
    }

    createRoom(roomId: string): void {
        if (!this.activeRooms[roomId]) {
            this.activeRooms[roomId] = { users: [], lockedItems: {} };
        }
    }

    deleteRoom(roomId: string, callBack?: (user: User) => void): void {
        callBack && this.activeRooms[roomId].users.forEach((user) => callBack(user));
        delete this.activeRooms[roomId];
    }

    addUser(roomId: string, user: User): void {
        // create room first if it doesn't exist
        if (!this.activeRooms[roomId]) {
            this.createRoom(roomId);
        }
        this.activeRooms[roomId].users.push(user);
    }

    updateUser(roomId: string, user: User): boolean {
        if (this.activeRooms[roomId]) {
            const { users } = this.activeRooms[roomId];
            const index = users.findIndex(({ id }) => id === user.id);
            if (index !== -1) {
                const oldUser = users[index];
                // always merged oldData because nevers FE never sends user.client
                users.splice(index, 1, { ...oldUser, ...user });
                return true;
            }
        }
        return false;
    }

    removeUser(roomId: string, userId: string): string[] {
        const unlockedIds: string[] = [];
        const room = this.activeRooms[roomId];
        if (room) {
            room.users = room.users.filter(({ id }) => userId !== id);
            // keep track of unlocked items so message can be broadcasted
            const newLockItems: typeof room.lockedItems = {};
            Object.entries(room.lockedItems).forEach(([itemId, lockUserId]) => {
                if (lockUserId === userId) unlockedIds.push(itemId);
                else newLockItems[itemId] = lockUserId;
            });
            room.lockedItems = newLockItems;
        }
        return unlockedIds;
    }

    canEditItem(roomId: string, userId: string, itemId: string): boolean {
        if (this.activeRooms[roomId]) {
            const lockUser = this.activeRooms[roomId].lockedItems[itemId];
            return !lockUser || lockUser === userId;
        }
        return false;
    }

    toggleItemsLock(roomId: string, userId: string, lockData: LockData): string[] {
        const sucessfullIds: string[] = [];
        if (this.activeRooms[roomId]) {
            const { itemIds, lockState } = lockData;
            const lockedItems = { ...this.activeRooms[roomId].lockedItems };
            itemIds.forEach((id) => {
                const lockUser = lockedItems[id];
                if (lockState && !lockUser) {
                    lockedItems[id] = userId;
                    sucessfullIds.push(id);
                } else if (!lockState && lockUser === userId) {
                    delete lockedItems[id];
                    sucessfullIds.push(id);
                }
            });
            this.activeRooms[roomId].lockedItems = lockedItems;
        }
        return sucessfullIds;
    }
}

export default RoomManager;
