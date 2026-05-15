import asyncio
import sys
import traceback

sys.path.insert(0, '.')

async def main():
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://www.who.int/api/hubs/diseaseoutbreaknews",
                params={"sf_culture": "en", "$top": 3}
            )
            print("STATUS:", resp.status_code)
            print("HEADERS:", dict(list(resp.headers.items())[:5]))
            body = resp.text[:500]
            print("BODY PREVIEW:", body)
    except Exception as e:
        print("ERROR:", type(e).__name__, str(e))
        traceback.print_exc()

asyncio.run(main())
